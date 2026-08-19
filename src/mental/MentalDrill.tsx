import { useCallback, useEffect, useMemo, useState } from 'react';
import { mulberry32, newSeed } from '../core/rng';
import { useKeys } from '../hooks/useKeys';
import { MASTERY_LABEL, assess, loadProgress, responseModeFor, saveAttempt, statOf } from './progress';
import { choicesFor } from './choices';
import { getPrefs } from '../core/prefs';
import { targetFor } from './techniques';
import type { MentalProgress } from './progress';
import { techniqueById } from './techniques';
import type { MentalItem } from './techniques';

/**
 * Le drill. Un item, une réponse, puis — seulement si c'est nécessaire — le
 * pas-à-pas de la technique appliqué aux nombres qu'on vient de rater.
 *
 * Juste et rapide : on enchaîne tout seul, pour garder le rythme.
 * Faux ou lent : on s'arrête et on lit. C'est là, et seulement là, qu'on
 * apprend quelque chose — dérouler la méthode après une réussite rapide ne fait
 * que casser la cadence.
 */

const AUTO_ADVANCE_MS = 650;

interface Answered {
  id: string;
  ok: boolean;
  ms: number;
}

export interface DrillProps {
  /** Suite de techniques, une par item. */
  ids: string[];
  title: string;
  subtitle: string;
  onExit: () => void;
}

export function MentalDrill({ ids, title, subtitle, onExit }: DrillProps) {
  const [index, setIndex] = useState(0);
  const [seed, setSeed] = useState(() => newSeed());
  const [phase, setPhase] = useState<'answer' | 'feedback'>('answer');
  const [input, setInput] = useState('');
  const [given, setGiven] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => performance.now());
  const [answered, setAnswered] = useState<Answered[]>([]);

  const done = index >= ids.length;
  const technique = done ? null : techniqueById(ids[index]);
  const item = useMemo<MentalItem | null>(
    () => (technique ? technique.generate(mulberry32(seed)) : null),
    [technique, seed],
  );

  /**
   * Le mode suit la maîtrise : on produit tant que la technique n'est pas
   * acquise, puis on passe au QCM — le geste réel de l'épreuve, et le plus
   * rapide à enchaîner.
   */
  const mode = useMemo(() => {
    if (!technique) return 'produire' as const;
    const verdict = assess(statOf(loadProgress(), technique.id), technique.targetMs);
    return responseModeFor(getPrefs().mentalResponse, verdict.level);
  }, [technique, index]);

  const choices = useMemo(
    () => (item && mode === 'qcm' ? choicesFor(item, mulberry32(seed ^ 0x5f5f)) : null),
    [item, mode, seed],
  );

  /** Le calcul ne va pas plus vite en QCM : seule la sortie coûte moins. */
  const target = technique ? targetFor(technique, mode) : 0;

  const last = answered[answered.length - 1];
  const slow = phase === 'feedback' && technique !== null && last !== undefined && last.ms > target;
  const showMethod = phase === 'feedback' && last !== undefined && (!last.ok || slow);

  const submit = useCallback(
    (raw: string) => {
      if (!technique || !item || phase !== 'answer') return;
      const ms = Math.round(performance.now() - startedAt);
      const ok =
        choices !== null
          ? raw === choices.options[choices.correctIndex]
          : item.kind === 'value'
          ? Number(raw.replace(',', '.')) === item.answer
          : item.kind === 'letter'
            ? raw.trim().toUpperCase() === item.answer
            : (raw === 'F') === item.wrong;
      saveAttempt(technique.id, { ok, ms });
      setGiven(raw);
      setAnswered((a) => [...a, { id: technique.id, ok, ms }]);
      setPhase('feedback');
    },
    [technique, item, phase, startedAt, choices],
  );

  const next = useCallback(() => {
    setIndex((i) => i + 1);
    setSeed(newSeed());
    setInput('');
    setGiven(null);
    setPhase('answer');
    setStartedAt(performance.now());
  }, []);

  // Juste et rapide : on repart tout seul. Sinon on laisse la méthode à l'écran
  // aussi longtemps qu'il le faut.
  useEffect(() => {
    if (phase !== 'feedback' || showMethod) return;
    const t = window.setTimeout(next, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [phase, showMethod, next]);

  useKeys((e) => {
    if (done) return;
    if (phase === 'answer' && choices !== null) {
      const n = Number(e.key);
      if (n >= 1 && n <= 4) {
        e.preventDefault();
        submit(choices.options[n - 1]);
        return;
      }
    }
    if (phase === 'feedback') {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        next();
      }
      return;
    }
    if (item?.kind === 'verdict') {
      const key = e.key.toLowerCase();
      if (key === 'j') submit('J');
      if (key === 'f') submit('F');
    }
  });

  if (done) return <Recap answered={answered} onExit={onExit} />;
  if (!technique || !item) return null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-sm text-zinc-500">{subtitle}</p>
        </div>
        <button onClick={onExit} className="text-sm text-zinc-500 hover:text-zinc-300">
          Quitter
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {ids.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < index ? (answered[i]?.ok ? 'bg-green-600' : 'bg-red-600') : i === index ? 'bg-sky-500' : 'bg-zinc-800'
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        Item {index + 1} / {ids.length} · {technique.name}
      </p>

      <div
        className={`mt-4 rounded-xl border p-8 text-center transition-colors ${
          phase === 'feedback'
            ? last?.ok
              ? 'border-green-600 bg-green-950/20'
              : 'border-red-600 bg-red-950/20'
            : 'border-zinc-800 bg-zinc-900/60'
        }`}
      >
        <p className="font-mono text-4xl font-bold tracking-tight md:text-5xl">{item.prompt}</p>

        {choices !== null ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {choices.options.map((o, i) => {
              const isAnswer = i === choices.correctIndex;
              const picked = given === o;
              return (
                <button
                  key={i}
                  onClick={() => phase === 'answer' && submit(o)}
                  className={`rounded-lg border-2 px-3 py-3 font-mono text-2xl font-bold transition-colors ${
                    phase === 'feedback'
                      ? isAnswer
                        ? 'border-green-500 bg-green-600/20 text-green-200'
                        : picked
                          ? 'border-red-500 bg-red-600/20 text-red-200'
                          : 'border-zinc-800 text-zinc-600'
                      : 'border-zinc-700 text-zinc-100 hover:border-sky-500'
                  }`}
                >
                  <span className="mr-2 text-xs font-normal text-zinc-500">{i + 1}</span>
                  {o}
                </button>
              );
            })}
          </div>
        ) : item.kind === 'value' || item.kind === 'letter' ? (
          <input
            key={index}
            autoFocus
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^\d]/g, ''))}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              if (phase === 'answer') {
                if (input !== '') submit(input);
              } else next();
            }}
            readOnly={phase === 'feedback'}
            className="mt-6 w-48 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-center font-mono text-3xl outline-none focus:border-sky-500"
            placeholder="?"
          />
        ) : (
          <div className="mt-6 flex justify-center gap-3">
            <VerdictKey label="J" hint="juste" active={given === 'J'} phase={phase} correct={!item.wrong} />
            <VerdictKey label="F" hint="faux" active={given === 'F'} phase={phase} correct={item.wrong} />
          </div>
        )}

        {phase === 'answer' && (
          <p className="mt-4 text-xs text-zinc-600">
            {choices !== null
              ? 'Clique la bonne réponse, ou tape 1, 2, 3 ou 4.'
              : item.kind === 'value'
              ? 'Tape le résultat, puis Entrée.'
              : item.kind === 'letter'
                ? 'Tape la lettre, puis Entrée.'
                : 'J si l’affirmation est juste, F si elle est fausse.'}
          </p>
        )}

        {phase === 'feedback' && (
          <p className={`mt-4 font-semibold ${last?.ok ? 'text-green-400' : 'text-red-400'}`}>
            {last?.ok ? 'Juste' : 'Faux'}
            {(item.kind === 'value' || item.kind === 'letter') &&
              !last?.ok &&
              ` — c’était ${item.answer}`}
            <span className="ml-2 font-normal text-zinc-500">
              {((last?.ms ?? 0) / 1000).toFixed(1)} s · objectif {(target / 1000).toFixed(1)} s
            </span>
          </p>
        )}
      </div>

      {showMethod && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
            {technique.name}
            {last?.ok && slow ? ' — juste, mais trop lent' : ''}
          </p>
          <p className="mt-1 text-zinc-300">{technique.rule}</p>
          <ol className="mt-3 space-y-1.5">
            {item.walkthrough.map((line, i) => (
              <li key={i} className="flex gap-3 text-zinc-200">
                <span className="w-5 shrink-0 text-right font-mono text-zinc-600">{i + 1}</span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
          <button
            onClick={next}
            autoFocus
            className="mt-4 rounded-lg bg-sky-600 px-5 py-2 font-semibold hover:bg-sky-500"
          >
            Suivant →
          </button>
          <span className="ml-3 text-xs text-zinc-600">Entrée</span>
        </div>
      )}
    </div>
  );
}

function VerdictKey({
  label,
  hint,
  active,
  phase,
  correct,
}: {
  label: string;
  hint: string;
  active: boolean;
  phase: 'answer' | 'feedback';
  correct: boolean;
}) {
  const revealed = phase === 'feedback';
  const tone = !revealed
    ? 'border-zinc-700 text-zinc-300'
    : correct
      ? 'border-green-500 bg-green-600/20 text-green-300'
      : active
        ? 'border-red-500 bg-red-600/20 text-red-300'
        : 'border-zinc-800 text-zinc-600';
  return (
    <div className={`rounded-lg border px-6 py-3 ${tone} ${active ? 'ring-2 ring-zinc-500' : ''}`}>
      <p className="font-mono text-2xl font-bold">{label}</p>
      <p className="text-xs opacity-70">{hint}</p>
    </div>
  );
}

function Recap({ answered, onExit }: { answered: Answered[]; onExit: () => void }) {
  const progress: MentalProgress = loadProgress();
  const byTechnique = new Map<string, Answered[]>();
  for (const a of answered) byTechnique.set(a.id, [...(byTechnique.get(a.id) ?? []), a]);
  const correct = answered.filter((a) => a.ok).length;

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold">Séance terminée</h2>
      <p className="mt-1 text-zinc-400">
        {correct} / {answered.length} juste{correct > 1 ? 's' : ''}.
      </p>

      <div className="mt-5 space-y-2">
        {[...byTechnique.entries()].map(([id, items]) => {
          const technique = techniqueById(id);
          if (!technique) return null;
          const verdict = assess(statOf(progress, id), technique.targetMs);
          const justes = items.filter((i) => i.ok).length;
          return (
            <div
              key={id}
              className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{technique.name}</p>
                <p className="text-xs text-zinc-500">
                  {justes} / {items.length} · {verdict.medianMs === null ? '—' : `${(verdict.medianMs / 1000).toFixed(1)} s`} médian
                  {verdict.tooSlow ? ' · trop lent' : ''}
                </p>
              </div>
              <MasteryChip level={verdict.level} />
            </div>
          );
        })}
      </div>

      <button onClick={onExit} className="mt-6 rounded-lg bg-sky-600 px-6 py-2.5 font-semibold hover:bg-sky-500">
        Retour à l’atelier
      </button>
    </div>
  );
}

export function MasteryChip({ level }: { level: keyof typeof MASTERY_LABEL }) {
  const tone: Record<string, string> = {
    neuf: 'border-zinc-700 text-zinc-500',
    fragile: 'border-red-800 bg-red-950/30 text-red-300',
    'en-cours': 'border-amber-800 bg-amber-950/30 text-amber-300',
    acquis: 'border-green-800 bg-green-950/30 text-green-300',
  };
  return (
    <span className={`shrink-0 rounded-full border px-3 py-1 text-xs ${tone[level]}`}>{MASTERY_LABEL[level]}</span>
  );
}
