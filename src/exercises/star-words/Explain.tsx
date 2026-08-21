import { Link } from 'react-router-dom';
import type { ExplainProps } from '../../core/types';
import type { StarAnswer, StarQuestion } from './generator';
import { StarSvg } from './StarSvg';
import { diagnoseStarAnswer, normaliseStarAnswer } from './explanation';
import { placementOf } from './validator';

/** Correction visuelle : la réponse se lit dans l'étoile, pas dans une suite d'indices. */
export function StarWordsExplain({ item, answer }: ExplainProps<StarQuestion, StarAnswer>) {
  const q = item.question;
  const givenAnswer = normaliseStarAnswer(answer);
  const givenPlacement = placementOf(q, givenAnswer);
  const solutionPlacement = q.solution.map((wordIndex) => q.words[wordIndex]);
  const diagnosis = diagnoseStarAnswer(q, answer);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid items-start gap-5 md:grid-cols-2">
        <CorrectionGrid
          title="Ta grille"
          subtitle={diagnosis.kind === 'valid' ? 'Configuration cohérente' : 'Les conflits apparaissent en rouge'}
          placement={givenPlacement}
          tone={diagnosis.kind === 'valid' ? 'correct' : 'given'}
        />
        <CorrectionGrid
          title="Une solution correcte"
          subtitle="Les six mots sont posés ; les cases bleues portent la même lettre des deux côtés"
          placement={solutionPlacement}
          tone="correct"
        />
      </div>

      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-200">
        <Diagnosis diagnosis={diagnosis} />
        <p className="mt-3 text-zinc-400">
          La méthode : ne relève que la <strong className="text-zinc-200">3e</strong> et la{' '}
          <strong className="text-zinc-200">5e lettre</strong> de chaque mot, pars de la lettre la
          plus rare, puis propage autour de l’étoile. Toute grille complète sans conflit est acceptée,
          même si elle diffère de celle affichée ici.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          to="/learn/star-words"
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold hover:bg-sky-500"
        >
          Voir la leçon pas à pas
        </Link>
        <Link
          to="/tips/star-words"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-sky-500"
        >
          Voir les astuces complètes
        </Link>
      </div>
    </div>
  );
}

function CorrectionGrid({
  title,
  subtitle,
  placement,
  tone,
}: {
  title: string;
  subtitle: string;
  placement: (string | null)[];
  tone: 'given' | 'correct';
}) {
  return (
    <section
      className={`rounded-xl border p-4 ${
        tone === 'correct'
          ? 'border-green-800/70 bg-green-950/10'
          : 'border-amber-800/70 bg-amber-950/10'
      }`}
    >
      <h3 className={`font-semibold ${tone === 'correct' ? 'text-green-400' : 'text-amber-400'}`}>
        {title}
      </h3>
      <p className="mt-0.5 min-h-10 text-xs text-zinc-500">{subtitle}</p>
      <div className="mt-1 flex justify-center">
        <StarSvg placement={placement} size={390} framed={false} showSlotLabels={false} />
      </div>
    </section>
  );
}

function Diagnosis({ diagnosis }: { diagnosis: ReturnType<typeof diagnoseStarAnswer> }) {
  if (diagnosis.kind === 'incomplete') {
    return (
      <p>
        <strong className="text-amber-400">Grille incomplète :</strong> {diagnosis.placedCount} mot
        {diagnosis.placedCount > 1 ? 's' : ''} sur 6. Les six côtés doivent être remplis avant de
        vérifier les croisements.
      </p>
    );
  }
  if (diagnosis.kind === 'duplicate') {
    return (
      <p>
        <strong className="text-amber-400">Un mot est utilisé deux fois.</strong> Chaque proposition
        ne peut occuper qu’un seul côté de l’étoile.
      </p>
    );
  }
  if (diagnosis.kind === 'conflict') {
    const c = diagnosis.conflict;
    return (
      <p>
        <strong className="text-red-400">Premier conflit :</strong>{' '}
        <span className="font-mono">{c.wordA}</span> impose <strong>{c.letterA}</strong> avec sa{' '}
        {c.positionA}e lettre, tandis que <span className="font-mono">{c.wordB}</span> impose{' '}
        <strong>{c.letterB}</strong> avec sa {c.positionB}e. Les deux lettres occupent la même case :
        l’un de ces deux mots doit changer de côté ou être retiré.
      </p>
    );
  }
  return (
    <p>
      <strong className="text-green-400">Ta grille est cohérente.</strong> Les six croisements portent
      la même lettre pour les deux mots qui s’y rencontrent.
    </p>
  );
}
