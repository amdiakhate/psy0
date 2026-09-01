import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  BlockResult,
  ContinuousEvent,
  Item,
  SessionPlan,
  SessionRecord,
} from '../core/types';
import { appendEvent, flushNow } from '../core/eventlog';
import { adaptiveStep, initAdaptive, newSessionId, saveLevel, saveSession, getSavedLevel } from '../core/session';
import type { AdaptiveState } from '../core/session';
import { newSeed } from '../core/rng';
import { getExercise } from '../exercises';
import type { AnyExerciseModule } from '../exercises';
import { useKeys } from '../hooks/useKeys';
import { buildDebrief } from '../coach/debriefing';
import { familyReport } from '../coach/simulation';
import { onDailyCompleted } from '../coach/daily';
import { parisMoment } from '../coach/daily-logic';
import { clearSuspended, saveSuspended } from '../coach/suspended';
import { getPrefs } from '../core/prefs';
import { markDirty } from '../sync/sync';
import { exportDayLog } from '../core/logs';
import { SessionLogScreen } from './SessionLogScreen';
import { ExternalBlock } from './ExternalBlock';
import type { ExternalEntry } from '../coach/external';

type Phase = 'briefing' | 'interstitial' | 'halfway' | 'running' | 'log' | 'debrief';

const MODE_TITLES: Partial<Record<SessionPlan['mode'], string>> = {
  guided90: 'Session guidée 1 h 30',
  guided120: 'Session guidée 2 h',
};

function planTitle(plan: SessionPlan): string {
  if (plan.meta?.daily === 'morning') return 'Session du matin';
  return MODE_TITLES[plan.mode] ?? 'Session guidée';
}

interface BlockStats {
  items: number;
  correct: number;
  rtSum: number;
}

/**
 * Moteur de session agnostique : déroule les blocs d'un SessionPlan,
 * mesure les temps de réponse, logge chaque item dans l'event log,
 * applique la difficulté adaptative, et produit le récapitulatif.
 */
export function SessionRunner({
  plan,
  onExit,
  renderDebrief,
}: {
  plan: SessionPlan;
  onExit: () => void;
  renderDebrief?: (record: SessionRecord) => React.ReactNode;
}) {
  const sessionId = useMemo(newSessionId, []);
  const sessionStart = useMemo(() => Date.now(), []);
  const fastHalfway = useMemo(() => getPrefs().dev.fastHalfway, []);
  const [phase, setPhase] = useState<Phase>(plan.briefing ? 'briefing' : 'interstitial');
  const [blockIndex, setBlockIndex] = useState(0);
  const [record, setRecord] = useState<SessionRecord | null>(null);

  const blockResults = useRef<BlockResult[]>([]);
  const posInSession = useRef(0);
  /** Posé par le BlockRunner actif : permet de récupérer les stats partielles sur Échap. */
  const partialCollector = useRef<(() => BlockResult) | null>(null);
  /** Créneaux faits sur Pilotest et saisis à la main pendant la séance. */
  const externals = useRef<ExternalEntry[]>([]);

  const block = plan.blocks[blockIndex];
  const module_ = block ? getExercise(block.exercise) : null;

  const finishSession = useCallback(() => {
    if (partialCollector.current) {
      const partial = partialCollector.current();
      if (partial.items > 0) blockResults.current.push(partial);
      partialCollector.current = null;
    }
    const rec: SessionRecord = {
      sessionId,
      mode: plan.mode,
      startedAt: sessionStart,
      endedAt: Date.now(),
      blocks: blockResults.current,
    };
    saveSession(rec);
    flushNow();
    if (plan.meta?.daily) onDailyCompleted(plan);
    // La séance est finie : le prochain passage du bandeau poussera vers le
    // serveur. Rien n'est envoyé pendant la séance elle-même.
    markDirty();
    setRecord(rec);
    // Sessions du matin : log obligatoire avant le débriefing.
    // Une séance entièrement externe n'a joué aucun item ici — mais elle a
    // produit des mesures. Sans cette seconde condition, la saisie manuelle
    // partait à la poubelle au moment précis où elle est la seule donnée fiable.
    const played = rec.blocks.some((b) => b.items > 0) || externals.current.length > 0;
    setPhase(plan.meta?.requiresLog && played ? 'log' : 'debrief');
  }, [plan, sessionId, sessionStart]);

  /**
   * Sauvegarde de reprise, posée à chaque fin de bloc.
   *
   * Les items joués partaient déjà dans le journal, mais la POSITION dans la
   * séance, elle, ne survivait à rien : un onglet fermé ou un plantage et il
   * fallait tout reprendre au premier bloc. Dix minutes perdues pour une erreur
   * de rendu, c'est le genre de punition qui décourage de s'entraîner.
   *
   * On réutilise le mécanisme de la coupure de mi-parcours : mêmes données,
   * même écran de reprise sur l'accueil. La sauvegarde est effacée dès que la
   * séance se termine normalement, pour ne pas proposer de reprendre ce qui est
   * déjà fini.
   */
  const autosave = useCallback(
    (nextIndex: number) => {
      const rest = plan.blocks.slice(nextIndex);
      if (rest.length === 0) return;
      saveSuspended({
        savedAt: Date.now(),
        dayKey: parisMoment(new Date()).dayKey,
        title: planTitle(plan),
        doneMin: Math.round((Date.now() - sessionStart) / 60_000),
        plan: {
          ...plan,
          blocks: rest,
          briefing: undefined,
          meta: { ...plan.meta, halfwayIndex: undefined, resumed: true },
        },
      });
    },
    [plan, sessionStart],
  );

  /**
   * Passe au bloc suivant, ou clôt la séance. Partagé par les blocs joués ici
   * et par les créneaux faits sur Pilotest : ces derniers ne produisent pas de
   * `BlockResult`, mais ils occupent une place dans le plan et doivent faire
   * avancer la séance exactement pareil — autosave comprise.
   */
  const advanceBlock = useCallback(() => {
    // Le journal des items part avec : sans ça, une reprise repartirait avec
    // des compteurs à jour mais un historique amputé du dernier bloc.
    flushNow();
    if (blockIndex + 1 < plan.blocks.length) {
      autosave(blockIndex + 1);
      setBlockIndex(blockIndex + 1);
      // Bascule de mise au point : déclenche la coupure dès le premier bloc,
      // pour valider l'écran sans jouer 45 minutes.
      const cutAt = fastHalfway && plan.meta?.halfwayIndex !== undefined ? 1 : plan.meta?.halfwayIndex;
      setPhase(cutAt === blockIndex + 1 ? 'halfway' : 'interstitial');
    } else {
      // Séance terminée : plus rien à reprendre.
      clearSuspended();
      finishSession();
    }
  }, [blockIndex, plan.blocks.length, plan.meta?.halfwayIndex, fastHalfway, finishSession, autosave]);

  const finishBlock = useCallback(
    (result: BlockResult) => {
      partialCollector.current = null; // le bloc est comptabilisé, pas de double collecte sur Échap
      blockResults.current.push(result);
      saveLevel(result.exercise, result.endLevel);
      advanceBlock();
    },
    [advanceBlock],
  );

  const finishExternal = useCallback(
    (entry: ExternalEntry | null) => {
      if (entry) externals.current.push(entry);
      advanceBlock();
    },
    [advanceBlock],
  );

  /**
   * Coupure de mi-parcours : on met les blocs restants de côté et on clôt la
   * séance ici. La rotation quotidienne n'avance PAS et le log n'est pas
   * demandé — la séance n'est pas finie, seulement coupée.
   */
  const suspendHere = useCallback(() => {
    const rest = plan.blocks.slice(blockIndex);
    saveSuspended({
      savedAt: Date.now(),
      dayKey: parisMoment(new Date()).dayKey,
      title: planTitle(plan),
      doneMin: Math.round((Date.now() - sessionStart) / 60_000),
      plan: { ...plan, blocks: rest, briefing: undefined, meta: { ...plan.meta, halfwayIndex: undefined, resumed: true } },
    });
    const rec: SessionRecord = {
      sessionId,
      mode: plan.mode,
      startedAt: sessionStart,
      endedAt: Date.now(),
      blocks: blockResults.current,
    };
    saveSession(rec);
    flushNow();
    markDirty();
    setRecord(rec);
    setPhase('debrief');
  }, [plan, blockIndex, sessionId, sessionStart]);

  useKeys((e) => {
    if (phase === 'log') return; // le log est obligatoire, pas de raccourci pour l'esquiver
    if (e.key === ' ' && (phase === 'briefing' || phase === 'interstitial' || phase === 'halfway')) {
      e.preventDefault();
      // briefing → interstitiel, mi-parcours → interstitiel, interstitiel → en jeu.
      setPhase(phase === 'interstitial' ? 'running' : 'interstitial');
    }
    if (e.key === 'Escape' && phase !== 'debrief') {
      if (blockResults.current.length > 0 || posInSession.current > 0) finishSession();
      else onExit();
    }
    if (e.key === ' ' && phase === 'debrief') onExit();
  });

  if (phase === 'briefing') {
    return (
      <Screen>
        <h2 className="text-xl font-semibold text-sky-400">Briefing</h2>
        {/* Une séance composée sans consigne reste utile ; la faire passer pour
            une séance ciblée, non. Le bandeau est au-dessus du briefing parce
            qu'il conditionne la lecture de tout ce qui suit. */}
        {plan.meta?.degraded && (
          <p className="mt-4 rounded-lg border border-amber-700 bg-amber-950/30 p-4 text-amber-200">
            {plan.meta.degraded}
          </p>
        )}
        <div className="mt-4 space-y-2 text-lg">
          {plan.briefing?.map((line, i) => <p key={i}>{line}</p>)}
        </div>
        <Hint>Espace pour commencer · Échap pour quitter</Hint>
      </Screen>
    );
  }

  if (phase === 'halfway' && block) {
    const restSec = plan.blocks.slice(blockIndex).reduce((s, b) => s + (b.durationSec ?? 0), 0);
    const done = blockResults.current;
    const items = done.reduce((s, b) => s + b.items, 0);
    const correct = done.reduce((s, b) => s + b.correct, 0);
    return (
      <Screen>
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Mi-parcours</p>
        <h2 className="mt-2 text-2xl font-bold">
          {blockIndex} blocs faits{items > 0 && ` · ${Math.round((100 * correct) / items)} % de précision`}
        </h2>
        <p className="mt-3 text-zinc-400">
          Il reste {plan.blocks.length - blockIndex} blocs, soit environ {Math.round(restSec / 60)} min.
          Tu peux enchaîner, ou couper ici et reprendre la seconde moitié plus tard depuis l'accueil.
        </p>
        <p className="mt-3 text-sm text-zinc-500">
          Une séance coupée en deux vaut mieux qu'une seconde heure jouée en pilote automatique :
          les données qu'elle produirait fausseraient l'analyse.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setPhase('interstitial')}
            className="rounded-lg bg-sky-600 px-5 py-2 font-semibold hover:bg-sky-500"
          >
            Continuer (Espace)
          </button>
          <button
            onClick={suspendHere}
            className="rounded-lg border border-zinc-700 px-5 py-2 text-zinc-300 hover:border-zinc-500"
          >
            Couper ici — reprendre plus tard
          </button>
        </div>
      </Screen>
    );
  }

  if (phase === 'interstitial' && block && module_) {
    return (
      <Screen>
        <p className="text-sm uppercase tracking-widest text-zinc-500">
          Bloc {blockIndex + 1}/{plan.blocks.length}
        </p>
        <h2 className="mt-2 text-3xl font-bold">{module_.name}</h2>
        {block.label && <p className="mt-2 text-amber-400">{block.label}</p>}
        <p className="mt-3 text-zinc-400">{module_.description}</p>
        <p className="mt-1 text-sm text-zinc-500">
          {block.durationSec
            ? `${Math.round(block.durationSec / 60)} min`
            : `${block.itemCount} items`}
          {block.tagFilter ? ` · drill ciblé : ${block.tagFilter}` : ''}
        </p>
        {block.external && (
          <p className="mt-3 rounded-lg border border-amber-800/60 bg-amber-950/20 px-3 py-2 text-sm text-amber-300">
            Créneau à faire sur Pilotest — l’exercice ne se lancera pas ici.
          </p>
        )}
        <Hint>Espace pour {block.external ? 'ouvrir le créneau' : 'démarrer'}</Hint>
      </Screen>
    );
  }

  if (phase === 'running' && block && block.external) {
    return (
      <ExternalBlock
        key={blockIndex}
        exercise={block.exercise}
        minutes={Math.round((block.durationSec ?? 0) / 60)}
        onDone={(entry) => finishExternal(entry)}
        onSkip={() => finishExternal(null)}
      />
    );
  }

  if (phase === 'running' && block && module_) {
    return (
      <BlockRunner
        key={blockIndex}
        sessionId={sessionId}
        sessionStart={sessionStart}
        plan={plan}
        blockIndex={blockIndex}
        posRef={posInSession}
        partialRef={partialCollector}
        onBlockEnd={finishBlock}
      />
    );
  }

  if (phase === 'log' && record) {
    return (
      <SessionLogScreen
        record={record}
        plan={plan}
        externals={externals.current}
        onDone={() => setPhase('debrief')}
      />
    );
  }

  if (phase === 'debrief' && record) {
    return (
      <Screen wide>
        <h2 className="text-xl font-semibold text-sky-400">Session terminée</h2>
        {renderDebrief ? (
          renderDebrief(record)
        ) : (
          <DefaultDebrief record={record} />
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onExit}
            className="rounded-lg bg-sky-600 px-5 py-2 font-semibold hover:bg-sky-500"
          >
            Retour (Espace)
          </button>
          {plan.meta?.requiresLog && <CopyDayLogButton />}
        </div>
      </Screen>
    );
  }

  return null;
}

function DefaultDebrief({ record }: { record: SessionRecord }) {
  const debrief = buildDebrief(record);
  return (
    <div>
      {record.mode === 'simulation' && <SimulationReport record={record} />}
      <div className="mt-4 flex items-baseline gap-6">
        <p>
          <span className="text-3xl font-bold">{Math.round(debrief.accuracy * 100)} %</span>{' '}
          <span className="text-sm text-zinc-500">de précision · {debrief.items} items</span>
        </p>
        {debrief.prevAccuracy !== null && (
          <p
            className={`text-sm font-semibold ${
              debrief.accuracy >= debrief.prevAccuracy ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {debrief.accuracy >= debrief.prevAccuracy ? '▲' : '▼'}{' '}
            {Math.abs(Math.round((debrief.accuracy - debrief.prevAccuracy) * 100))} pt vs session précédente (
            {Math.round(debrief.prevAccuracy * 100)} %)
          </p>
        )}
      </div>
      <div className="mt-4 rounded-lg border border-sky-900/60 bg-sky-950/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Le focus</p>
        <p className="mt-1 text-zinc-200">{debrief.insight}</p>
      </div>
      <BlocksTable record={record} />
    </div>
  );
}

const VERDICT_STYLE: Record<string, string> = {
  acquis: 'text-green-400',
  'à consolider': 'text-amber-400',
  critique: 'text-red-400',
};

/** Rapport de simulation : verdict par famille, du plus faible au plus fort. */
function SimulationReport({ record }: { record: SessionRecord }) {
  const report = familyReport(record);
  return (
    <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Verdict par famille</p>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {report.map((r) => (
          <li key={r.family} className="flex items-center justify-between rounded bg-zinc-950/50 px-3 py-1.5 text-sm">
            <span>{r.family}</span>
            <span className={`font-semibold ${VERDICT_STYLE[r.verdict]}`}>
              {Math.round(r.accuracy * 100)} % · {r.verdict}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BlocksTable({ record }: { record: SessionRecord }) {
  return (
    <table className="mt-4 w-full text-left">
      <thead>
        <tr className="border-b border-zinc-800 text-sm text-zinc-500">
          <th className="py-2">Exercice</th>
          <th>Items</th>
          <th>Précision</th>
          <th>Temps moyen</th>
          <th>Niveau final</th>
        </tr>
      </thead>
      <tbody>
        {record.blocks.map((b, i) => {
          const name = getExercise(b.exercise).name;
          return (
            <tr key={i} className="border-b border-zinc-900">
              <td className="py-2 font-medium">{name}</td>
              <td>{b.items}</td>
              <td className={b.items > 0 && b.correct / b.items >= 0.75 ? 'text-green-400' : 'text-amber-400'}>
                {b.items > 0 ? `${Math.round((100 * b.correct) / b.items)} %` : '—'}
              </td>
              <td>{b.items > 0 ? `${(b.avgRtMs / 1000).toFixed(1)} s` : '—'}</td>
              <td>{b.endLevel}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Déroule UN bloc : items per-item ou exercice continu. Monté avec key={blockIndex} → état frais par bloc. */
function BlockRunner({
  sessionId,
  sessionStart,
  plan,
  blockIndex,
  posRef,
  partialRef,
  onBlockEnd,
}: {
  sessionId: string;
  sessionStart: number;
  plan: SessionPlan;
  blockIndex: number;
  posRef: React.MutableRefObject<number>;
  partialRef: React.MutableRefObject<(() => BlockResult) | null>;
  onBlockEnd: (result: BlockResult) => void;
}) {
  const block = plan.blocks[blockIndex];
  const module_ = getExercise(block.exercise);

  const startLevel = block.level === 'adaptive' ? getSavedLevel(block.exercise) : block.level;
  const [adaptive, setAdaptive] = useState<AdaptiveState>(() =>
    initAdaptive(Math.min(startLevel, module_.levels), module_.levels),
  );
  const [item, setItem] = useState<Item>(() =>
    module_.generate(newSeed(), Math.min(startLevel, module_.levels), block.tagFilter),
  );
  const [feedback, setFeedback] = useState<{ n: number; ok: boolean; expected: string } | null>(null);
  // Item raté mis de côté pour la correction visuelle. Tant qu'il est là, la
  // séance est en pause : on ne génère PAS l'item suivant, sinon l'explication
  // porterait sur une figure qui n'est plus à l'écran.
  const [review, setReview] = useState<{ item: Item; answer: unknown; correct: boolean; rtMs: number } | null>(null);
  // Temps passé dans les corrections, retranché du chrono du bloc : lire une
  // explication ne doit pas manger le temps d'entraînement que le coach a prévu.
  const explainedMs = useRef(0);
  const reviewStart = useRef(0);
  /**
   * Palier d'astuce révélé pour l'item courant : 0 = rien, 1 = où regarder,
   * 2 = le premier geste. Deux paliers plutôt qu'un seul bloc, pour qu'on
   * puisse s'arrêter au premier — c'est souvent tout ce qui manquait.
   */
  const [hintLevel, setHintLevel] = useState(0);
  /**
   * Limite officielle par question. En simulation elle s'impose toujours : une
   * simulation sans les contraintes du test ne simule rien.
   */
  const itemLimitSec =
    module_.itemLimitSec !== undefined && (getPrefs().itemTimeLimit || plan.mode === 'simulation')
      ? module_.itemLimitSec
      : null;
  const [itemLeft, setItemLeft] = useState<number | null>(itemLimitSec);
  // Un item résolu AVEC astuce ne mesure pas le même niveau qu'un item résolu
  // seul. Sans cette marque, le tableau de bord surestimerait la progression.
  const usedHintRef = useRef(false);
  const stats = useRef<BlockStats>({ items: 0, correct: 0, rtSum: 0 });
  const blockStart = useRef(Date.now());
  const itemShownAt = useRef(Date.now());
  const [remaining, setRemaining] = useState(block.durationSec ?? 0);
  const adaptiveRef = useRef(adaptive);
  adaptiveRef.current = adaptive;

  // Le bandeau s'efface seul. Une erreur reste plus longtemps qu'une réussite :
  // il faut le temps de lire la réponse attendue, alors qu'un « juste » n'a
  // rien à faire lire — il doit seulement se voir.
  useEffect(() => {
    if (feedback === null || review !== null) return;
    const t = window.setTimeout(() => setFeedback(null), feedback.ok ? 700 : 1600);
    return () => window.clearTimeout(t);
  }, [feedback]);

  const endBlock = useCallback(() => {
    const s = stats.current;
    onBlockEnd({
      exercise: block.exercise,
      items: s.items,
      correct: s.correct,
      avgRtMs: s.items > 0 ? s.rtSum / s.items : 0,
      endLevel: adaptiveRef.current.level,
    });
  }, [block.exercise, onBlockEnd]);
  const endBlockRef = useRef(endBlock);
  endBlockRef.current = endBlock;

  // Expose les stats partielles au SessionRunner (fin de session sur Échap en plein bloc).
  useEffect(() => {
    partialRef.current = () => ({
      exercise: block.exercise,
      items: stats.current.items,
      correct: stats.current.correct,
      avgRtMs: stats.current.items > 0 ? stats.current.rtSum / stats.current.items : 0,
      endLevel: adaptiveRef.current.level,
    });
    return () => {
      partialRef.current = null;
    };
  }, [block.exercise, partialRef]);

  // Chrono du bloc (exercices per-item : coupe aussi en plein item ;
  // continuous : c'est le composant qui termine via onFinished)
  useEffect(() => {
    if (!block.durationSec) return;
    const t = setInterval(() => {
      const left = block.durationSec! - (Date.now() - blockStart.current) / 1000;
      setRemaining(Math.max(0, left));
      if (left <= 0 && module_.timed === 'per-item') {
        clearInterval(t);
        endBlockRef.current();
      }
    }, 250);
    return () => clearInterval(t);
  }, [block.durationSec, module_.timed]);

  const logEvent = useCallback(
    (e: { tags: string[]; correct: boolean; rtMs: number; given: string; expected: string; level: number; seed: number }) => {
      posRef.current += 1;
      appendEvent({
        ts: Date.now(),
        sessionId,
        mode: plan.mode,
        exercise: block.exercise,
        level: e.level,
        seed: e.seed,
        tags: e.tags,
        // performance.now() rend des décimales : la colonne rt_ms est entière.
        rtMs: Math.round(e.rtMs),
        correct: e.correct,
        given: e.given,
        expected: e.expected,
        posInSession: posRef.current,
        minuteInSession: Math.floor((Date.now() - sessionStart) / 60_000),
      });
      stats.current.items += 1;
      if (e.correct) stats.current.correct += 1;
      stats.current.rtSum += e.rtMs;
    },
    [sessionId, plan.mode, block.exercise, posRef, sessionStart],
  );

  const handleAnswer = useCallback(
    (answer: unknown) => {
      const rtMs = Date.now() - itemShownAt.current;
      const correct = module_.validate(item, answer);
      module_.onAttemptResult?.({
        item,
        answer,
        correct,
        rtMs,
        sessionId,
        mode: plan.mode,
      });
      logEvent({
        tags: usedHintRef.current ? [...item.tags, 'hint-used'] : item.tags,
        correct,
        rtMs,
        given: module_.answerToString(answer),
        expected: module_.expectedToString(item),
        level: item.level,
        seed: item.seed,
      });
      setFeedback({ n: stats.current.items, ok: correct, expected: module_.expectedToString(item) });

      // Le pas adaptatif se calcule AVANT toute sortie anticipée : une erreur
      // qui ouvre une correction doit peser sur le niveau comme les autres.
      const next = adaptiveStep(adaptiveRef.current, correct, rtMs);
      setAdaptive(next);

      // Arrêt sur image. Il ne dépend PLUS de l'existence d'un schéma : même
      // sans explication dédiée, figer la question et afficher la réponse
      // attendue vaut infiniment mieux qu'un bandeau qui survole la question
      // suivante. Jamais en simulation — au test, rien ne s'arrête.
      const pause = getPrefs().pauseAfterAnswer;
      const freeze = plan.mode !== 'simulation' && (pause === 'toujours' || (pause === 'erreurs' && !correct));
      if (freeze) {
        reviewStart.current = Date.now();
        setReview({ item, answer, correct, rtMs });
        return;
      }

      const elapsed = (Date.now() - blockStart.current - explainedMs.current) / 1000;
      const doneByCount = block.itemCount !== undefined && stats.current.items >= block.itemCount;
      const doneByTime = block.durationSec !== undefined && elapsed >= block.durationSec;
      if (doneByCount || doneByTime) {
        endBlockRef.current();
        return;
      }
      setItem(module_.generate(newSeed(), next.level, block.tagFilter));
      itemShownAt.current = Date.now();
      setHintLevel(0);
      usedHintRef.current = false;
      setItemLeft(itemLimitSec);
    },
    [module_, item, logEvent, block.itemCount, block.durationSec, block.tagFilter, plan.mode, sessionId, itemLimitSec],
  );

  /** Reprise après une correction : c'est ici que l'item suivant est enfin tiré. */
  const closeReview = useCallback(() => {
    explainedMs.current += Date.now() - reviewStart.current;
    setReview(null);
    setFeedback(null);
    const elapsed = (Date.now() - blockStart.current - explainedMs.current) / 1000;
    const doneByCount = block.itemCount !== undefined && stats.current.items >= block.itemCount;
    const doneByTime = block.durationSec !== undefined && elapsed >= block.durationSec;
    if (doneByCount || doneByTime) {
      endBlockRef.current();
      return;
    }
    const next = adaptiveRef.current;
    setItem(module_.generate(newSeed(), next.level, block.tagFilter));
    itemShownAt.current = Date.now();
    setHintLevel(0);
    usedHintRef.current = false;
    setItemLeft(itemLimitSec);
  }, [module_, block.itemCount, block.durationSec, block.tagFilter, itemLimitSec]);

  // L'astuce se calcule sur l'item courant, pas sur une table figée : elle
  // désigne la méthode qui s'applique ICI.
  const hint = useMemo(
    () =>
      module_.hint && getPrefs().hintsEnabled && plan.mode !== 'simulation'
        ? module_.hint(item)
        : null,
    [module_, item, plan.mode],
  );

  /**
   * Question perdue au chrono. On l'enregistre comme une NON-RÉPONSE et non
   * comme une erreur ordinaire : manquer de temps et se tromper sont deux
   * défauts différents, et les confondre empêcherait le coach de voir lequel
   * des deux te coûte des points.
   */
  const handleTimeout = useCallback(() => {
    module_.onAttemptResult?.({
      item,
      answer: undefined,
      correct: false,
      rtMs: Math.round((itemLimitSec ?? 0) * 1000),
      sessionId,
      mode: plan.mode,
    });
    logEvent({
      tags: [...item.tags, 'timeout', ...(usedHintRef.current ? ['hint-used'] : [])],
      correct: false,
      rtMs: Math.round((itemLimitSec ?? 0) * 1000),
      given: 'temps écoulé',
      expected: module_.expectedToString(item),
      level: item.level,
      seed: item.seed,
    });
    setFeedback({ n: stats.current.items, ok: false, expected: module_.expectedToString(item) });

    // Une question perdue au chrono est justement celle dont on n'a pas vu la
    // solution : elle mérite l'arrêt sur image autant qu'une erreur.
    // Le pas adaptatif s'applique AVANT toute sortie : une question perdue au
    // chrono doit peser sur le niveau, qu'on marque une pause ou non.
    setAdaptive(adaptiveStep(adaptiveRef.current, false, Math.round((itemLimitSec ?? 0) * 1000)));

    const pause = getPrefs().pauseAfterAnswer;
    if (plan.mode !== 'simulation' && pause !== 'jamais') {
      reviewStart.current = Date.now();
      setReview({ item, answer: undefined, correct: false, rtMs: Math.round((itemLimitSec ?? 0) * 1000) });
      return;
    }

    const elapsed = (Date.now() - blockStart.current - explainedMs.current) / 1000;
    const doneByCount = block.itemCount !== undefined && stats.current.items >= block.itemCount;
    const doneByTime = block.durationSec !== undefined && elapsed >= block.durationSec;
    if (doneByCount || doneByTime) {
      endBlockRef.current();
      return;
    }
    const next = adaptiveRef.current;
    setItem(module_.generate(newSeed(), next.level, block.tagFilter));
    itemShownAt.current = Date.now();
    setHintLevel(0);
    usedHintRef.current = false;
    setItemLeft(itemLimitSec);
  }, [module_, item, logEvent, block.itemCount, block.durationSec, block.tagFilter, itemLimitSec, plan.mode, sessionId]);

  const timeoutRef = useRef(handleTimeout);
  timeoutRef.current = handleTimeout;

  // Décompte de la question courante. Suspendu pendant une correction : le
  // chrono d'une question ne doit pas courir pendant qu'on lit pourquoi on a
  // raté la précédente.
  useEffect(() => {
    if (itemLimitSec === null || review !== null) return;
    const id = window.setInterval(() => {
      const left = itemLimitSec - (Date.now() - itemShownAt.current) / 1000;
      if (left <= 0) {
        setItemLeft(0);
        timeoutRef.current();
      } else {
        setItemLeft(left);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [itemLimitSec, review, item.seed]);

  /** H révèle le palier suivant. Deux paliers, puis plus rien de plus. */
  const revealHint = useCallback(() => {
    if (!hint) return;
    setHintLevel((l) => {
      const max = hint.step ? 2 : 1;
      if (l >= max) return l;
      usedHintRef.current = true;
      return l + 1;
    });
  }, [hint]);

  useKeys((e) => {
    if (review !== null) return;
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      revealHint();
    }
  });

  // Exercices continus : compteurs par séquence pour adapter le niveau ENTRE les
  // séquences (l'adaptation par item serait bien trop rapide sur des fenêtres d'1 s).
  const seqStats = useRef({ items: 0, correct: 0 });

  const onContinuousEvent = useCallback(
    (e: ContinuousEvent) => {
      logEvent({ ...e, level: item.level, seed: item.seed });
      seqStats.current.items += 1;
      if (e.correct) seqStats.current.correct += 1;
    },
    [logEvent, item.level, item.seed],
  );

  // Fin d'une séquence continue : ajuste le niveau (≥85 % → +1, <60 % → −1),
  // puis nouvelle séquence si le bloc n'est pas fini.
  const onContinuousFinished = useCallback(() => {
    const { items: n, correct } = seqStats.current;
    if (n >= 5) {
      const acc = correct / n;
      setAdaptive((s) => {
        const level = acc >= 0.85 ? Math.min(s.maxLevel, s.level + 1) : acc < 0.6 ? Math.max(1, s.level - 1) : s.level;
        const next = { ...s, level };
        adaptiveRef.current = next;
        return next;
      });
    }
    seqStats.current = { items: 0, correct: 0 };
    const elapsed = (Date.now() - blockStart.current) / 1000;
    if (block.durationSec !== undefined && elapsed < block.durationSec - 2) {
      setItem(module_.generate(newSeed(), adaptiveRef.current.level, block.tagFilter));
      itemShownAt.current = Date.now();
    } else {
      endBlockRef.current();
    }
  }, [block.durationSec, block.tagFilter, module_]);

  const Component = module_.Component;

  // Progression du bloc : par items (blocs « N questions ») ou par temps (blocs chronométrés).
  const progress =
    block.itemCount !== undefined
      ? stats.current.items / block.itemCount
      : block.durationSec !== undefined && block.durationSec > 0
        ? 1 - remaining / block.durationSec
        : 0;

  // Blocs chronométrés per-item : estimation des questions restantes à partir
  // du temps médian de réponse observé dans le bloc (sinon la durée type de l'exercice).
  let estRemaining: number | null = null;
  if (block.durationSec !== undefined && module_.timed === 'per-item') {
    const rts = [...adaptive.rts].sort((a, b) => a - b);
    const medianMs = rts.length >= 3 ? rts[Math.floor(rts.length / 2)] : module_.defaultItemSeconds * 1000;
    estRemaining = Math.max(0, Math.round((remaining * 1000) / Math.max(medianMs, 500)));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 text-sm text-zinc-400">
        <span>
          {module_.name} · niveau {adaptive.level}
          {block.tagFilter && <span className="text-amber-400"> · drill : {block.tagFilter}</span>}
          {plan.blocks.length > 1 && (
            <span className="text-zinc-600"> · bloc {blockIndex + 1}/{plan.blocks.length}</span>
          )}
        </span>
        <span className="flex items-center gap-4 font-mono">
          <span title="bonnes réponses / questions jouées">
            ✓ {stats.current.correct}/{stats.current.items}
          </span>
          {itemLeft !== null && (
            <span
              className={`rounded px-2 py-0.5 font-mono tabular-nums ${
                itemLeft <= 3
                  ? 'bg-red-950/60 text-red-300'
                  : itemLeft <= 8
                    ? 'bg-amber-950/50 text-amber-300'
                    : 'text-zinc-400'
              }`}
              title="Limite officielle par question"
            >
              {Math.ceil(itemLeft)} s
            </span>
          )}
          {block.itemCount !== undefined && (
            <span className="text-sky-300">
              Question {Math.max(1, Math.min(stats.current.items + (review === null ? 1 : 0), block.itemCount))}/{block.itemCount}
            </span>
          )}
          {block.durationSec !== undefined && (
            <span className={remaining < 10 ? 'text-red-400' : ''}>
              ⏱ {Math.floor(remaining / 60)}:{String(Math.floor(remaining % 60)).padStart(2, '0')}
            </span>
          )}
          {estRemaining !== null && (
            <span className="text-zinc-500" title="estimation au rythme actuel">
              ≈ {estRemaining > 99 ? '99+' : estRemaining} restantes
            </span>
          )}
        </span>
      </div>
      {/* Barre de progression du bloc : la fin est toujours visible. */}
      <div className="h-1 w-full bg-zinc-900">
        <div
          className="h-full bg-sky-600 transition-[width] duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        />
      </div>
      <div
        key={feedback?.n ?? -1}
        className={`relative flex-1 overflow-auto rounded-b-xl p-6 ${
          feedback === null ? '' : feedback.ok ? 'flash-correct' : 'flash-wrong'
        } ${hint !== null && review === null ? 'pb-20' : ''}`}
      >
        {feedback !== null && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center p-3">
            <div
              className={`flash-badge flex items-center gap-3 rounded-full border px-5 py-2 font-semibold shadow-lg ${
                feedback.ok
                  ? 'border-green-500 bg-green-600 text-white'
                  : 'border-red-500 bg-red-600 text-white'
              }`}
            >
              <span className="text-lg leading-none">{feedback.ok ? '\u2713' : '\u2717'}</span>
              <span>{feedback.ok ? 'Juste' : 'Faux'}</span>
              {!feedback.ok && !module_.visualCorrectionOnly && feedback.expected !== '' && (
                <span className="font-normal opacity-90">{'\u2192'} {feedback.expected}</span>
              )}
            </div>
          </div>
        )}
        {hint !== null && review === null && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-3">
            <button
              onClick={revealHint}
              className={`pointer-events-auto max-w-2xl rounded-xl border px-4 py-2 text-left text-sm transition-colors ${
                hintLevel === 0
                  ? 'border-zinc-700 text-zinc-500 hover:border-amber-600 hover:text-amber-400'
                  : 'border-amber-800/60 bg-amber-950/30 text-amber-200'
              }`}
            >
              {hintLevel === 0 ? (
                <span>
                  Astuce · touche <kbd className="rounded bg-zinc-800 px-1 text-zinc-300">H</kbd>
                </span>
              ) : (
                <>
                  <p>{hint.where}</p>
                  {hintLevel >= 2 && hint.step && (
                    <p className="mt-1 border-t border-amber-800/40 pt-1 text-amber-100">{hint.step}</p>
                  )}
                  {hintLevel === 1 && hint.step && (
                    <p className="mt-1 text-xs text-amber-500/70">
                      Encore <kbd className="rounded bg-zinc-800 px-1">H</kbd> pour le premier geste
                    </p>
                  )}
                </>
              )}
            </button>
          </div>
        )}
        {review !== null ? (
          <Review
            module_={module_}
            item={review.item}
            answer={review.answer}
            correct={review.correct}
            rtMs={review.rtMs}
            onNext={closeReview}
          />
        ) : (
          <Component
            item={item}
            onAnswer={handleAnswer}
            durationSec={module_.timed === 'continuous' ? block.durationSec : undefined}
            onContinuousEvent={module_.timed === 'continuous' ? onContinuousEvent : undefined}
            onFinished={module_.timed === 'continuous' ? onContinuousFinished : undefined}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Écran de correction : le schéma qui montre POURQUOI, puis on reprend.
 *
 * Il occupe toute la place de l'exercice plutôt que de s'afficher à côté : une
 * explication qu'on lit du coin de l'œil pendant que la question suivante
 * s'affiche n'est pas lue du tout.
 */
function Review({
  module_,
  item,
  answer,
  correct,
  rtMs,
  onNext,
}: {
  module_: AnyExerciseModule;
  item: Item;
  answer: unknown;
  correct: boolean;
  rtMs: number;
  onNext: () => void;
}) {
  useKeys((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNext();
    }
  });

  const Explain = module_.Explain;
  const Component = module_.Component;
  const expected = module_.expectedToString(item);
  const given = answer === undefined ? 'temps écoulé' : module_.answerToString(answer);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        {/* Bandeau de correction : il porte la vérité même quand l'exercice ne
            sait pas se montrer, et reste à l'écran tant qu'on n'enchaîne pas. */}
        <div
          className={`mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border px-4 py-3 ${
            correct ? 'border-green-700 bg-green-950/30' : 'border-red-700 bg-red-950/30'
          }`}
        >
          <span className={`font-semibold ${correct ? 'text-green-300' : 'text-red-300'}`}>
            {correct ? '✓ Juste' : '✗ Faux'}
          </span>
          {!correct && !module_.visualCorrectionOnly && (
            <>
              <span className="text-sm text-zinc-400">
                Ta réponse : <span className="font-mono text-zinc-200">{given}</span>
              </span>
              {expected !== '' && (
                <span className="text-sm text-zinc-400">
                  Attendu : <span className="font-mono text-green-300">{expected}</span>
                </span>
              )}
            </>
          )}
        </div>

        {Explain ? (
          <Explain item={item} answer={answer} correct={correct} rtMs={rtMs} />
        ) : (
          /* Pas de schéma dédié : on REFIGE la question elle-même. `onAnswer`
             est neutralisé — l'arrêt sur image ne doit rien enregistrer — et
             `revealAnswer` invite l'exercice à montrer sa solution s'il sait. */
          <Component item={item} onAnswer={() => {}} revealAnswer givenAnswer={answer} />
        )}
      </div>
      <div className="mt-4 flex shrink-0 items-center gap-3">
        <button
          onClick={onNext}
          autoFocus
          className="rounded-lg bg-sky-600 px-6 py-2.5 font-semibold hover:bg-sky-500"
        >
          Continuer
        </button>
        <span className="text-xs text-zinc-500">
          Espace ou Entrée · le temps de lecture n’est pas décompté de la séance · désactivable dans
          Réglages
        </span>
      </div>
    </div>
  );
}

/** Export « log du jour » en texte brut, une ligne par exercice, copié dans le presse-papier. */
function CopyDayLogButton() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const text = exportDayLog(parisMoment(new Date()).dayKey);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copie manuelle :', text);
    }
  };
  return (
    <button onClick={copy} className="rounded-lg border border-zinc-700 px-5 py-2 text-zinc-300 hover:border-zinc-500">
      {copied ? 'Copié ✓' : 'Copier le log du jour'}
    </button>
  );
}

function Screen({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className={`w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} rounded-xl border border-zinc-800 bg-zinc-900/60 p-8`}>
        {children}
      </div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 text-sm text-zinc-500">{children}</p>;
}
