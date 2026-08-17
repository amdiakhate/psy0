import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import type {
  AnswerKey,
  Branch,
  Color,
  Fill,
  Shape,
  ShapesColorsAnswer,
  ShapesColorsQuestion,
} from './generator';
import { COLORS, SHAPES, attrLabel } from './generator';
import { ShapeGlyph } from './ShapeGlyph';
import { useKeys } from '../../hooks/useKeys';

/** Délai avant démarrage automatique si la consigne n'est pas validée au clavier. */
const AUTOSTART_MS = 20_000;
/** Durée d'affichage du « correct / faux ». */
const FEEDBACK_MS = 800;

type Phase = 'brief' | 'running';

/**
 * « Formes et couleurs » : deux règles EN CASCADE annoncées avant la série
 * (1er critère le remplissage, 2e critère la couleur ou la forme selon la
 * branche), puis 30 stimuli qui défilent tout seuls. Chaque forme n'est
 * affichée que 0,5 s : la réponse (N ou X) se donne sur l'écran vide.
 */
export function ShapesColorsExercise({
  item,
  onContinuousEvent,
  onFinished,
}: ExerciseComponentProps<ShapesColorsQuestion, ShapesColorsAnswer>) {
  const q = item.question;
  const [phase, setPhase] = useState<Phase>('brief');
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [feedback, setFeedback] = useState<'ok' | 'ko' | null>(null);

  const answered = useRef(false);
  const shownAt = useRef(0);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cbRef = useRef({ onContinuousEvent, onFinished });
  cbRef.current = { onContinuousEvent, onFinished };

  // Nouvelle série (nouvel item) → retour à l'écran de consigne.
  useEffect(() => {
    setPhase('brief');
    setIndex(0);
    setFeedback(null);
    setVisible(true);
    answered.current = false;
    return () => clearTimeout(feedbackTimer.current);
  }, [item.seed]);

  const flash = useCallback((kind: 'ok' | 'ko') => {
    setFeedback(kind);
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), FEEDBACK_MS);
  }, []);

  // Consigne : démarrage au clavier, ou automatique pour ne jamais bloquer un bloc.
  useEffect(() => {
    if (phase !== 'brief') return;
    const t = setTimeout(() => setPhase('running'), AUTOSTART_MS);
    return () => clearTimeout(t);
  }, [phase, item.seed]);

  // Défilement : la forme paraît visibleMs, la fenêtre de réponse dure intervalMs.
  useEffect(() => {
    if (phase !== 'running') return;
    const stim = q.stimuli[index];
    if (!stim) return;

    answered.current = false;
    shownAt.current = Date.now();
    setVisible(true);

    const hide = setTimeout(() => setVisible(false), q.visibleMs);
    const next = setTimeout(() => {
      if (!answered.current) {
        cbRef.current.onContinuousEvent?.({
          tags: [...stim.tags, 'timeout'],
          correct: false,
          rtMs: q.intervalMs,
          given: '—',
          expected: stim.key,
        });
        flash('ko');
      }
      if (index + 1 < q.stimuli.length) setIndex(index + 1);
      else cbRef.current.onFinished?.();
    }, q.intervalMs);

    return () => {
      clearTimeout(hide);
      clearTimeout(next);
    };
  }, [phase, index, item.seed, q, flash]);

  const answer = useCallback(
    (key: AnswerKey) => {
      if (phase !== 'running' || answered.current) return;
      const stim = q.stimuli[index];
      if (!stim) return;
      answered.current = true;
      const correct = key === stim.key;
      cbRef.current.onContinuousEvent?.({
        tags: stim.tags,
        correct,
        rtMs: Date.now() - shownAt.current,
        given: key,
        expected: stim.key,
      });
      flash(correct ? 'ok' : 'ko');
    },
    [phase, index, q, flash],
  );

  useKeys((e) => {
    if (phase === 'brief') {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setPhase('running');
      }
      return;
    }
    if (e.key === 'n' || e.key === 'N') answer('N');
    if (e.key === 'x' || e.key === 'X') answer('X');
  });

  if (phase === 'brief') return <Briefing q={q} />;

  const stim = q.stimuli[index];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="flex max-w-3xl flex-col gap-1 text-center text-sm text-zinc-500">
        {q.ruleLabels.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>

      <div className="flex h-56 w-56 items-center justify-center rounded-2xl border-2 border-zinc-700 bg-zinc-900">
        {visible && stim && (
          <ShapeGlyph shape={stim.shape} color={stim.color} fill={stim.fill} size={160} />
        )}
      </div>

      <div className="h-7">
        {feedback === 'ok' && <p className="text-lg font-bold text-green-400">correct</p>}
        {feedback === 'ko' && <p className="text-lg font-bold text-red-400">faux</p>}
      </div>

      <div className="flex items-center gap-6 text-zinc-400">
        <Key label="N" />
        <Key label="X" />
        <span className="font-mono text-zinc-600">
          {Math.min(index + 1, q.stimuli.length)}/{q.stimuli.length}
        </span>
      </div>
    </div>
  );
}

function Key({ label }: { label: string }) {
  return (
    <kbd className="rounded border border-zinc-600 bg-zinc-800 px-3 py-1 font-mono text-lg text-sky-400">
      {label}
    </kbd>
  );
}

/** Écran de consigne : les deux règles, avec les valeurs illustrées. */
function Briefing({ q }: { q: ShapesColorsQuestion }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <h3 className="text-lg font-semibold text-sky-400">Les règles de cette série</h3>
      <div className="flex w-full max-w-3xl flex-col gap-3">
        <RuleCard index={1} fill="vide" branch={q.rules.vide} label={q.ruleLabels[0]} />
        <RuleCard index={2} fill="rempli" branch={q.rules.rempli} label={q.ruleLabels[1]} />
      </div>
      <p className="max-w-2xl text-center text-sm text-zinc-500">
        {q.stimuli.length} formes, une toutes les {(q.intervalMs / 1000).toFixed(1)} s. Chaque forme
        n’est visible que {(q.visibleMs / 1000).toFixed(1)} s — tu réponds ensuite sur l’écran vide.
      </p>
      <p className="text-sm text-zinc-400">
        <kbd className="rounded border border-zinc-600 bg-zinc-800 px-2 py-0.5 font-mono text-sky-400">
          Espace
        </kbd>{' '}
        pour lancer la série
      </p>
    </div>
  );
}

function RuleCard({
  index,
  fill,
  branch,
  label,
}: {
  index: number;
  fill: Fill;
  branch: Branch;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-zinc-200">
        <span className="font-semibold text-sky-400">Règle n°{index}</span> —{' '}
        {label.replace(`Règle n°${index} : `, '')}
      </p>
      <div className="mt-3 flex flex-wrap gap-6">
        {(['N', 'X'] as const).map((key) => (
          <div key={key} className="flex items-center gap-3">
            <kbd className="rounded border border-zinc-600 bg-zinc-800 px-2.5 py-0.5 font-mono text-sky-400">
              {key}
            </kbd>
            {branch.entries
              .filter((e) => e.key === key)
              .map((e) => (
                <div key={String(e.value)} className="flex flex-col items-center">
                  <ShapeGlyph
                    shape={branch.attr === 'shape' ? (e.value as Shape) : SHAPES[0]}
                    color={branch.attr === 'color' ? (e.value as Color) : COLORS[0]}
                    fill={fill}
                    size={44}
                  />
                  <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                    {attrLabel(branch.attr, e.value)}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-zinc-600">
        {branch.attr === 'color'
          ? 'Dans cette branche, la forme n’a aucune importance : seule la couleur décide.'
          : 'Dans cette branche, la couleur n’a aucune importance : seule la forme décide.'}
      </p>
    </div>
  );
}
