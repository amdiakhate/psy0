import type { ExerciseModule } from '../../core/types';
import { generate, placementsToString } from './generator';
import type { SlidingAnswer, SlidingQuestion } from './generator';
import { validate } from './validator';
import { tips } from './tips';
import { lesson } from './lesson';
import { SlidingShapesExercise } from './SlidingShapesExercise';
import { LEVELS } from './config';

export const slidingShapes: ExerciseModule<SlidingQuestion, SlidingAnswer> = {
  id: 'sliding-shapes',
  name: 'Formes glissées - II',
  description:
    'Glisse 3 à 4 formes sur la grille centrale pour reconstituer la figure à reproduire. Superposition : marine + marine = marine, marine + gris = gris, gris + gris = marine. L’ordre de dépose n’a aucune importance.',
  families: ['Spatiale', 'Intellectuelle'],
  levels: LEVELS.length,
  defaultItemSeconds: 60, // Pilotest : 10 questions, 60 s maximum chacune
  timed: 'per-item',
  generate,
  validate,
  answerToString: (a) => placementsToString(a),
  expectedToString: (item) => placementsToString(item.question.solution),
  tips: {
    ...tips,
    examples: [
      {
        title: 'Sans chevauchement : chaque case grise n’a qu’une seule origine',
        seed: 7,
        level: 1,
        forceTag: 'no-overlap',
        walkthrough: [
          'Aucune forme n’en recouvre une autre ici : le nombre de cases grises de la cible est exactement la somme des cases grises des trois formes. Vérifie-le, ça confirme qu’il n’y a pas de double passage à chercher.',
          'Repère les blocs gris isolés de la cible : chacun est le motif d’une seule forme, posé tel quel. Fais coïncider le motif d’une forme avec un bloc, puis lis la position du coin haut-gauche de sa BOÎTE (pas de sa première case grise).',
          'Pose, puis compare la grille de jeu à la cible ligne par ligne : la première ligne qui diffère localise le bloc suivant. Répète, la grille se résout en trois déposes sans aucun calcul de parité.',
        ],
      },
      {
        title: 'Avec chevauchement : deux gris superposés redeviennent marine',
        seed: 12,
        level: 4,
        forceTag: 'overlap',
        walkthrough: [
          'Compte les cases grises des quatre formes, puis celles de la cible. Le total de la cible est nettement PLUS PETIT : chaque case atteinte un nombre pair de fois est retombée en marine. Tu sais donc d’avance que des formes se recouvrent, et combien de cases ont disparu.',
          'Ne cherche pas à placer les formes « à côté » les unes des autres : une case marine au milieu du damier est souvent le produit de deux formes superposées, pas un trou.',
          'Commence par les ancres — un coin ou un bord gris qu’une seule forme peut produire — puis laisse la grille de jeu calculer le XOR à ta place : après chaque dépose, ce qui reste à corriger apparaît directement dans la comparaison avec la cible.',
          'Si une case reste grise alors qu’elle doit être marine, la solution n’est pas d’enlever du gris : c’est qu’une forme doit venir la re-basculer. Cherche la forme dont le motif couvre cette case ET les cases grises encore manquantes autour.',
        ],
      },
    ],
  },
  lesson,
  Component: SlidingShapesExercise,
};
