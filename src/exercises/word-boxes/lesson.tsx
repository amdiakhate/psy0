import type { Lesson } from '../../core/types';
import { generate } from './generator';
import { applyChoice, freeBoxes, initialState } from './model';
import type { BoxesState } from './model';

/**
 * Leçon « Boîtes à mots » : une série réelle rejouée avec la stratégie
 * « ordre d'apparition = ordre des boîtes ».
 *
 * Série : seed 3, niveau 3 → 5 boîtes, 5 mots par thème, 22 mots.
 * Les 5 premiers mots ouvrent les 5 champs lexicaux, dans cet ordre :
 *   1 curcuma      → Épices              → boîte 1
 *   2 futsal       → Sports collectifs   → boîte 2
 *   3 lilas        → Fleurs              → boîte 3
 *   4 échafaudeur  → Métiers du bâtiment → boîte 4
 *   5 Danemark     → Pays d'Europe       → boîte 5
 *
 * Mot 15 : « rugby » — les Sports collectifs ne sont pas revenus depuis le mot 2,
 * soit un écart de 13 mots. C'est le rappel lointain, où se concentrent les erreurs.
 */
const ITEM = generate(3, 3);
const Q = ITEM.question;

/** États successifs de la série, rejouée avec la stratégie de l'ordre. */
const HISTORY: BoxesState[] = (() => {
  const out: BoxesState[] = [initialState(Q.boxCount)];
  let state = out[0];
  for (const step of Q.steps) {
    const assigned = state.assignment[step.theme];
    const chosen = assigned === undefined ? freeBoxes(state, Q.boxCount)[0] : assigned;
    state = applyChoice(state, step, chosen, Q.boxCount).state;
    out.push(state);
  }
  return out;
})();

/** Index 0-based du mot mis en scène à chaque arrêt sur image. */
const AT = { first: 0, opened: 4, recall: 6, distant: 14 };

const DISTANT_STEP = Q.steps[AT.distant];

/** Thème de chaque boîte, dans l'ordre des boîtes (= ordre d'apparition des thèmes). */
const THEME_OF_BOX: string[] = (() => {
  const assignment = HISTORY[HISTORY.length - 1].assignment;
  const out = new Array<string>(Q.boxCount).fill('');
  for (const [theme, box] of Object.entries(assignment)) out[box] = theme;
  return out;
})();

function Boxes({ played, current }: { played: number; current: number | null }) {
  const state = HISTORY[played];
  const step = current === null ? null : Q.steps[current];
  const box = step ? state.assignment[step.theme] : undefined;
  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <div className="flex h-20 flex-col items-center justify-center">
        {step ? (
          <>
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Mot {current! + 1} / {Q.steps.length} · affiché {Q.wordMs} ms
            </p>
            <p className="text-5xl font-bold tracking-wide text-zinc-100">{step.word}</p>
          </>
        ) : (
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Avant le premier mot — {Q.boxCount} boîtes vides, sans étiquette
          </p>
        )}
      </div>

      <div
        className="grid w-full gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(Q.boxCount, 3)}, minmax(0, 1fr))` }}
      >
        {state.contents.map((words, i) => (
          <div
            key={i}
            className={`min-h-24 rounded-lg border-2 p-2 ${
              box === i
                ? 'border-green-500 bg-green-950/25'
                : words.length > 0
                  ? 'border-zinc-700 bg-zinc-900'
                  : 'border-dashed border-zinc-700 bg-zinc-900/40'
            }`}
          >
            <span className="font-mono text-xs text-zinc-500">{i + 1}</span>
            {words.length === 0 ? (
              <p className="mt-1 text-xs italic text-zinc-600">boîte libre</p>
            ) : (
              <ul className="mt-1 space-y-0.5">
                {words.map((w, k) => (
                  <li key={k} className="text-sm text-zinc-300">
                    {w}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function WordBoxesScene({ scene }: { scene: string; stepIndex: number }) {
  if (scene === 'empty') return <Boxes played={0} current={null} />;
  if (scene === 'first') return <Boxes played={AT.first} current={AT.first} />;
  if (scene === 'opened') return <Boxes played={AT.opened} current={AT.opened} />;
  if (scene === 'recall') return <Boxes played={AT.recall} current={AT.recall} />;
  if (scene === 'distant') return <Boxes played={AT.distant} current={AT.distant} />;
  if (scene === 'end') return <Boxes played={Q.steps.length} current={null} />;
  return <Boxes played={0} current={null} />;
}

export const lesson: Lesson = {
  reality: {
    atFirst:
      "Tu te tromperas sur les rappels lointains, et ça donnera l’impression d’une mémoire défaillante. Ce n’en est pas une : une association arbitraire vieille de cinq mots a été écrasée par les thèmes plus récents, chez tout le monde. La parade n’est pas de mieux se souvenir, c’est de fabriquer un lien qui ne demande pas de se souvenir.",
    budget:
      "Environ une minute par série. Tout le temps utile est concentré sur les CINQ PREMIERS mots : c’est là qu’on fabrique les associations. Après, il n’y a plus rien à réfléchir, seulement à restituer — et si tu réfléchis encore, c’est que l’encodage n’a pas été fait.",
    fallback: [
      "Trou de mémoire : ne fouille pas ta tête, SCANNE les boîtes. Chacune affiche les mots qu’elle contient déjà — cherche celle qui en contient un du même champ lexical. La reconnaissance est plus rapide et plus fiable que le rappel.",
      "Toujours rien : applique la règle d’ordre — le n-ième thème rencontré occupe la n-ième boîte. Même approximative, elle bat le hasard.",
      "Le délai expire : n’importe quelle boîte plausible vaut mieux qu’une non-réponse, qui compte comme fausse à coup sûr.",
    ],
    recover:
      "Une erreur passée ne se rejoue pas, et la ruminer pendant que le mot suivant s’affiche en coûte deux ou trois de plus. Le geste de récupération est mécanique : nomme le THÈME du mot en cours, puis seulement cherche sa boîte.",
    bail:
      "Rien ne s’abandonne. La seule décision qui compte se prend au tout début : prendre la première boîte libre sans hésiter, et encoder le lien à voix intérieure dans la seconde qui suit. Une seconde investie là vaut cinq rappels plus tard.",
  },
  title: 'Mémoriser ses propres attributions',
  intro: `${Q.boxCount} boîtes vides et sans étiquette, ${Q.steps.length} mots qui défilent, ${Q.wordMs} ms d'affichage puis ${Q.answerMs} ms pour répondre. Reconnaître le champ lexical d'un mot est trivial : ce qui est réellement testé, c'est ta mémoire des attributions que TU as créées.`,
  Scene: WordBoxesScene,
  steps: [
    {
      scene: 'empty',
      title: 'Le dispositif',
      observe: `${Q.boxCount} boîtes vides. Aucune n'a d'étiquette, aucune n'est dédiée à quoi que ce soit. Les mots vont arriver un par un, ${Q.wordMs} ms chacun.`,
      why: "Rien dans l'écran ne te dit où va un mot. Le lien « champ lexical → boîte » n'existe pas encore : c'est toi qui vas le créer, mot après mot, et c'est ce lien-là que l'exercice te demandera de restituer vingt fois.",
      pitfall:
        "Croire qu'il faut « deviner » la bonne boîte. Il n'y a rien à deviner tant qu'un thème n'a pas été ouvert — et une fois qu'il l'est, il n'y a plus rien à réfléchir non plus, seulement à se souvenir.",
    },
    {
      scene: 'first',
      title: 'Étape 1 — le premier mot d’un thème : liberté totale',
      observe: `« ${Q.steps[0].word} » ouvre le champ « ${Q.steps[0].theme} ». Aucune boîte n'est encore prise : toutes conviennent.`,
      why: "La règle officielle est explicite : au premier mot d'un champ lexical, tu attribues librement la boîte de ton choix, et ce choix est correct par définition. Hésiter ici, c'est perdre deux secondes sur une question qui n'existe pas.",
      action:
        "Prends la première boîte libre en partant de la gauche, sans réfléchir. Et surtout, encode le lien dans la seconde qui suit : « boîte 1, les épices ». Une seconde d'encodage volontaire ici te fait gagner cinq rappels plus tard.",
    },
    {
      scene: 'opened',
      title: 'Étape 2 — ordre d’apparition = ordre des boîtes',
      observe: `Les ${Q.boxCount} premiers mots ont ouvert les ${Q.boxCount} champs, chacun dans la boîte suivante : ${THEME_OF_BOX.map(
        (t, i) => `${i + 1} → ${t.toLowerCase()}`,
      ).join(' · ')}.`,
      why: "Tu remplaces un effort de mémoire pure (cinq associations arbitraires) par une règle unique : le n-ième thème rencontré occupe la n-ième boîte. Retrouver une boîte devient « à quel rang ce thème est-il apparu ? », une question à laquelle on répond plus vite et plus sûrement.",
      action:
        "Applique la règle sans exception, même quand une autre boîte te tente. Une règle appliquée à 100 % vaut mieux qu'une règle appliquée à 80 %.",
    },
    {
      scene: 'recall',
      title: 'Étape 3 — le rappel proche : deux étapes courtes',
      observe: `« ${Q.steps[AT.recall].word} » revient sur un champ vu il y a ${Q.steps[AT.recall].gap} mots. Sa boîte contient déjà un mot du même champ.`,
      why: "Nomme le THÈME avant de chercher la boîte, jamais l'inverse : « marguerite → les fleurs → troisième thème apparu → boîte 3 ». Deux étapes courtes et sûres valent mieux qu'un balayage des cinq boîtes au hasard.",
      pitfall:
        "Réfléchir au SENS du mot. « marguerite », « hypoténuse », « épagneul » sont limpides. Si tu passes plus d'une demi-seconde sur le mot lui-même, tu es en train de travailler sur la mauvaise question.",
    },
    {
      scene: 'distant',
      title: 'Étape 4 — le rappel lointain, le vrai piège',
      observe: `« ${DISTANT_STEP.word} » appartient aux « ${DISTANT_STEP.theme} »… qui ne sont pas réapparus depuis ${DISTANT_STEP.gap} mots. Entre-temps, quatre autres champs ont défilé plusieurs fois chacun.`,
      why: "C'est là que se concentrent les erreurs : la trace mémorielle de l'attribution a été écrasée par les thèmes intermédiaires, bien plus récents. Un thème absent depuis 5 mots ou plus est un rappel lointain, et c'est le seul cas où la réponse ne vient pas toute seule.",
      action:
        "Dès qu'un thème « disparaît » de la série, relance-toi volontairement son image mentale au lieu d'attendre son retour. C'est le seul entretien de mémoire qui rapporte pendant la série.",
    },
    {
      scene: 'distant',
      title: 'Étape 5 — l’aide-mémoire est à l’écran',
      observe:
        "Chaque boîte affiche les mots qu'elle contient déjà. La boîte 2 montre « futsal » — un sport collectif, comme le mot en cours.",
      why: "Sur un doute, ne fouille pas ta mémoire : scanne les boîtes et cherche celle qui contient un mot du même champ. La reconnaissance visuelle est bien plus rapide et bien plus fiable que le rappel pur, et le contenu affiché est exact par construction.",
      pitfall:
        "Sans réponse dans le délai imparti, le mot compte comme faux. Mieux vaut une boîte plausible tout de suite qu'une hésitation qui expire — et une erreur passée ne se rejoue pas : la ruminer pendant que le mot suivant s'affiche en coûte deux ou trois de plus.",
    },
    {
      scene: 'end',
      title: 'La série complète — où investir son temps',
      observe: `Fin de série : ${Q.steps.length} mots rangés, ${Q.boxCount} boîtes, cinq champs lexicaux parfaitement séparés.`,
      why: "L'effort n'est pas réparti uniformément. Les cinq premiers mots sont les seuls où le temps passé rapporte : c'est là qu'on fabrique les associations. Tout le reste doit être réflexe, sinon le rythme te dépasse.",
      action:
        "Cinq séries d'environ une minute au test. Consigne unique : encoder à fond sur les premiers mots de chaque série, puis répondre au quart de tour — et scanner les boîtes plutôt que sa mémoire dès qu'un doute apparaît.",
    },
  ],
};
