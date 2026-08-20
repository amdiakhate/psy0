import { useMemo, useState } from 'react';
import { mulberry32, newSeed } from '../core/rng';
import { ASKED, BANK, byTheme, counts } from '../culture/bank';
import { CultureQuiz } from '../culture/CultureQuiz';
import { QUIZ_SIZE, composeQuiz, expectedValue, presentEntry } from '../culture/quiz';
import type { QuizQuestion } from '../culture/quiz';
import { coverage, loadProgress, reviewOrder } from '../culture/progress';
import { THEMES, THEME_LABELS, THEME_SCOPE } from '../culture/types';
import type { CultureEntry, CultureTheme } from '../culture/types';

/**
 * Culture aéronautique.
 *
 * Séparée des 16 exercices à dessein : ce n'est pas une épreuve d'aptitude mais
 * une épreuve de SAVOIR. On ne l'améliore pas en allant plus vite, on
 * l'améliore en sachant — d'où une mécanique de révision espacée plutôt qu'un
 * niveau adaptatif, et aucune entrée dans les rotations ni dans la stanine.
 *
 * Format officiel, relevé sur les annales Pilotest 2018 et 2019 : 20 questions,
 * 4 propositions, environ 15 s chacune, +3 / −1 / 0.
 */

const REVISION_COUNT = 20;

interface Running {
  questions: QuizQuestion[];
  title: string;
  subtitle: string;
  exam: boolean;
}

export default function Culture() {
  const [running, setRunning] = useState<Running | null>(null);
  const [version, setVersion] = useState(0);
  const progress = useMemo(() => loadProgress(), [version]);
  const now = Date.now();

  if (running) {
    return (
      <CultureQuiz
        {...running}
        onExit={() => {
          setRunning(null);
          setVersion((v) => v + 1);
        }}
      />
    );
  }

  const global = coverage(BANK, progress, now);
  const n = counts();

  /** Révision : la révision espacée décide de l'ordre, on prend les premières. */
  const revise = (pool: CultureEntry[], title: string, subtitle: string) => {
    const rng = mulberry32(newSeed());
    const ordered = reviewOrder(pool, progress, Date.now()).slice(0, REVISION_COUNT);
    setRunning({
      questions: ordered.map((e) => presentEntry(e, rng)),
      title,
      subtitle,
      exam: false,
    });
  };

  const exam = () =>
    setRunning({
      questions: composeQuiz(BANK, QUIZ_SIZE, mulberry32(newSeed())),
      title: 'Test blanc',
      subtitle: `${QUIZ_SIZE} questions · 15 s chacune · +3 / −1 / 0 · corrections à la fin`,
      exam: true,
    });

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold">Culture aéronautique</h2>
      <p className="mt-2 max-w-2xl text-zinc-400">
        L’épreuve de connaissances de la présélection : 20 questions, 4 propositions, une seule
        bonne réponse, environ 15 s chacune. <span className="text-zinc-300">+3</span> si juste,{' '}
        <span className="text-zinc-300">−1</span> si faux, 0 pour un « je ne sais pas ».
      </p>

      <Bar label="Banque couverte" done={global.seen} total={global.total} />
      <Bar label="Solidement su" done={global.solid} total={global.total} accent="bg-green-500" />
      <p className="mt-2 text-sm text-zinc-500">
        {global.due} question{global.due > 1 ? 's' : ''} à revoir aujourd’hui sur {global.total}.
        La révision espacée repousse ce qui est acquis et fait revenir ce qui résiste.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Action
          onClick={() => revise(BANK, 'Révision du jour', `${REVISION_COUNT} questions, choisies par la révision espacée · correction après chacune`)}
          primary
        >
          Réviser {Math.min(REVISION_COUNT, global.total)} questions
        </Action>
        <Action onClick={exam}>Test blanc chronométré</Action>
        <Action
          onClick={() =>
            revise(
              ASKED,
              'Annales 2018 et 2019',
              `${ASKED.length} questions calquées sur ce qui est réellement tombé`,
            )
          }
        >
          Annales ({ASKED.length})
        </Action>
      </div>

      <Strategy />

      <h3 className="mt-10 text-sm uppercase tracking-widest text-zinc-500">
        Le programme — {BANK.length} questions
      </h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {THEMES.map((t) => (
          <ThemeCard
            key={t}
            theme={t}
            total={n[t]}
            cov={coverage(byTheme(t), progress, now)}
            onRevise={() =>
              revise(
                byTheme(t),
                THEME_LABELS[t],
                `${Math.min(REVISION_COUNT, n[t])} questions sur ${n[t]} · correction après chacune`,
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Le seul calcul qui change vraiment la note, et il est contre-intuitif : avec
 * ce barème, répondre au hasard ne coûte RIEN. L'afficher évite de laisser des
 * questions vides par prudence mal placée.
 */
function Strategy() {
  const rows = [4, 3, 2].map((k) => ({ k, ev: expectedValue(k) }));
  return (
    <div className="mt-6 rounded-xl border border-sky-900/60 bg-sky-950/20 p-4">
      <p className="text-sm font-semibold text-sky-200">
        Ce que le barème t’autorise — et que la plupart des candidats n’osent pas
      </p>
      <ul className="mt-2 space-y-1 text-sm text-sky-100/90">
        {rows.map(({ k, ev }) => (
          <li key={k}>
            <span className="font-mono tabular-nums">{k} propositions plausibles</span> → espérance{' '}
            <span className="font-mono tabular-nums">
              {ev > 0 ? '+' : ''}
              {ev.toFixed(2)}
            </span>{' '}
            point{Math.abs(ev) >= 2 ? 's' : ''}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-sky-100/80">
        Répondre au hasard sur quatre propositions rapporte zéro en moyenne : exactement ce que
        rapporte « je ne sais pas ». Dès que tu en élimines une seule, répondre devient gagnant. Ne
        laisse donc jamais une question vide — coche, même à l’aveugle.
      </p>
    </div>
  );
}

function ThemeCard({
  theme,
  total,
  cov,
  onRevise,
}: {
  theme: CultureTheme;
  total: number;
  cov: ReturnType<typeof coverage>;
  onRevise: () => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-semibold text-zinc-100">{THEME_LABELS[theme]}</h4>
        <span className="shrink-0 font-mono text-xs text-zinc-500">
          {cov.solid}/{total}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-400">{THEME_SCOPE[theme]}</p>
      <button
        onClick={onRevise}
        className="mt-3 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:border-sky-500 hover:bg-zinc-800"
      >
        Réviser · {cov.due} à revoir
      </button>
    </div>
  );
}

function Bar({
  label,
  done,
  total,
  accent = 'bg-sky-500',
}: {
  label: string;
  done: number;
  total: number;
  accent?: string;
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono tabular-nums text-zinc-500">
          {done}/{total}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className={`h-full ${accent}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Action({
  children,
  onClick,
  primary = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        primary
          ? 'rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500'
          : 'rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-sky-500 hover:bg-zinc-800'
      }
    >
      {children}
    </button>
  );
}
