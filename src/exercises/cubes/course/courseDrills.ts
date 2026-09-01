import type { CourseExercise, CourseFaceId, CubeCourseSkill } from './courseModel';
import { COURSE_CHAPTERS } from './courseModel';
import { ALL_ROTATIONS, applyRotation } from '../cube-model';
import { getSharedEdge, rotateEdge } from '../domain/cubeGeometry';
import type { FaceEdge, FacePosition, QuarterTurn } from '../domain/types';
import {
  COURSE_CUBE,
  COURSE_FACE_IDS,
  COURSE_FACE_TO_POSITION,
  getCourseOpposite,
  getCourseRing,
} from './courseFixtures';

const choice = (id: string, label = id) => ({ id, label });

const EDGE_LABEL: Readonly<Record<FaceEdge, string>> = {
  top: 'haut',
  right: 'droite',
  bottom: 'bas',
  left: 'gauche',
};

const TURN_LABEL: Readonly<Record<QuarterTurn, string>> = {
  0: 'Aucune',
  1: '90° antihoraire',
  2: '180°',
  3: '90° horaire',
};

function buildOrientationContext(
  faceId: CourseFaceId,
  anchorFaceId: CourseFaceId,
  turn: QuarterTurn,
): NonNullable<CourseExercise['orientationContext']> {
  const sourcePosition = COURSE_FACE_TO_POSITION[faceId];
  const sourceAnchorPosition = COURSE_FACE_TO_POSITION[anchorFaceId];
  const sourceShared = getSharedEdge(sourcePosition, sourceAnchorPosition);
  if (!sourceShared) throw new Error(`Faces pédagogiques non adjacentes : ${faceId}/${anchorFaceId}`);
  const targetEdge = rotateEdge(sourceShared.aEdge, turn);
  const rotation = ALL_ROTATIONS.find((candidate) => {
    const targetPosition = candidate.dest[sourcePosition] as FacePosition;
    const targetAnchorPosition = candidate.dest[sourceAnchorPosition] as FacePosition;
    return getSharedEdge(targetPosition, targetAnchorPosition)?.aEdge === targetEdge;
  });
  if (!rotation) throw new Error(`Rotation pédagogique introuvable : ${faceId}/${anchorFaceId}/${turn}`);
  return {
    originalCube: COURSE_CUBE,
    targetCube: applyRotation(COURSE_CUBE, rotation),
    faceId,
    anchorFaceId,
    sourceEdge: sourceShared.aEdge,
    targetEdge,
    referenceRot: COURSE_CUBE[sourcePosition].rot,
  };
}

function faceChoices(answer: CourseFaceId): CourseExercise['choices'] {
  const distractors = COURSE_FACE_IDS.filter((face) => face !== answer).slice(0, 3);
  const options = [answer, ...distractors];
  const offset = COURSE_FACE_IDS.indexOf(answer) % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)].map((face) => choice(face));
}

function exercise(
  chapterId: string,
  index: number,
  skill: CubeCourseSkill,
  prompt: string,
  choices: CourseExercise['choices'],
  answerId: string,
  explanation: string,
): CourseExercise {
  return { id: `${chapterId}-${index + 1}`, chapterId, skill, prompt, choices, answerId, explanation };
}

function repeatToCount(chapterId: string, source: readonly CourseExercise[], count: number): CourseExercise[] {
  return Array.from({ length: count }, (_, index) => {
    const base = source[index % source.length];
    return { ...base, id: `${chapterId}-${index + 1}` };
  });
}

function chapterExercises(chapterId: string): CourseExercise[] {
  if (chapterId === 'comprendre-le-patron') {
    return [
      exercise(chapterId, 0, 'identity', 'Quelle face reste à l’avant quand le patron commence à se plier ?', faceChoices('B'), 'B', 'B est la face centrale du patron de référence : elle sert de façade pendant ce pliage.'),
      exercise(chapterId, 1, 'identity', 'Quelle face vient fermer l’arrière du cube ?', faceChoices('D'), 'D', 'D est la quatrième face de la bande A–B–C–D ; elle referme l’arrière.'),
      exercise(chapterId, 2, 'identity', 'Quelle face devient le dessous du cube ?', faceChoices('F'), 'F', 'F est attachée sous B et se replie pour former le dessous.'),
    ];
  }

  if (chapterId === 'faces-opposees') {
    return repeatToCount(chapterId, COURSE_FACE_IDS.map((face, index) => {
      const answer = getCourseOpposite(face);
      return exercise(chapterId, index, 'opposites', `Quelle face est opposée à ${face} ?`, faceChoices(answer), answer, `${face} et ${answer} finissent face à face et ne partagent aucune arête.`);
    }), 5);
  }

  if (chapterId === 'faces-adjacentes') {
    return repeatToCount(chapterId, COURSE_FACE_IDS.slice(0, 4).map((face, index) => {
      const opposite = getCourseOpposite(face);
      return exercise(chapterId, index, 'adjacency', `Quelle face ne touche jamais ${face} ?`, faceChoices(opposite), opposite, `Toutes les faces touchent ${face}, sauf son opposée ${opposite}.`);
    }), 4);
  }

  if (chapterId === 'ceinture') {
    const belt = ['A', 'B', 'C', 'D'] as const;
    return belt.slice(0, 3).map((face, index) => {
      const next = belt[(index + 1) % belt.length];
      return exercise(chapterId, index, 'belt', `Dans la ceinture A–B–C–D, qui vient juste après ${face} ?`, belt.map((id) => choice(id)), next, 'La ceinture conserve cet ordre circulaire quand elle se referme autour du cube.');
    });
  }

  if (chapterId === 'changer-de-centre') {
    return ['A', 'E', 'F'].map((face, index) => exercise(chapterId, index, 'recenter', `Si ${face} devient centrale, quelle face ne peut pas être sa voisine ?`, faceChoices(getCourseOpposite(face as CourseFaceId)), getCourseOpposite(face as CourseFaceId), 'Changer le centre déplace les faces à l’écran, mais ne change jamais les opposées.'));
  }

  if (chapterId === 'anneau-des-voisins') {
    return ['B', 'E', 'A', 'F'].map((face, index) => {
      const ring = getCourseRing(face as CourseFaceId);
      const answerId = ring.join('-');
      const reversed = [ring[0], ring[3], ring[2], ring[1]].join('-');
      return exercise(chapterId, index, 'ring', `Quel anneau est possible autour de ${face} ?`, [choice(answerId, ring.join(' → ')), choice(reversed, reversed.split('-').join(' → '))], answerId, 'Une rotation peut décaler le point de départ, jamais inverser le sens de parcours.');
    });
  }

  if (chapterId === 'rotation-ou-miroir') {
    return Array.from({ length: 4 }, (_, index) => exercise(chapterId, index, 'mirror', index % 2 === 0 ? 'L’ordre a seulement été décalé : même cube ou miroir ?' : 'L’ordre a été inversé : même cube ou miroir ?', [choice('same', 'Même cube'), choice('mirror', 'Miroir')], index % 2 === 0 ? 'same' : 'mirror', index % 2 === 0 ? 'Le sens circulaire est conservé : c’est une rotation.' : 'Le sens circulaire est inversé : aucune rotation du cube ne peut produire cet ordre.'));
  }

  if (chapterId === 'orientation-symboles') {
    const cases = [
      { faceId: 'B', anchorFaceId: 'E', turn: 0 },
      { faceId: 'F', anchorFaceId: 'B', turn: 1 },
      { faceId: 'A', anchorFaceId: 'E', turn: 2 },
      { faceId: 'C', anchorFaceId: 'F', turn: 3 },
      { faceId: 'D', anchorFaceId: 'E', turn: 1 },
    ] as const satisfies ReadonlyArray<{ faceId: CourseFaceId; anchorFaceId: CourseFaceId; turn: QuarterTurn }>;
    return cases.map(({ faceId, anchorFaceId, turn }, index) => {
      const context = buildOrientationContext(faceId, anchorFaceId, turn);
      return {
        ...exercise(
          chapterId,
          index,
          'orientation',
          `Le bord ${EDGE_LABEL[context.sourceEdge]} de ${faceId} touche ${anchorFaceId}. Dans le patron cible, ${anchorFaceId} se trouve côté ${EDGE_LABEL[context.targetEdge]} de ${faceId}. Quelle rotation appliquer à ${faceId} ?`,
          ([0, 1, 2, 3] as const).map((candidate) => choice(String(candidate), TURN_LABEL[candidate])),
          String(turn),
          `La face ${faceId}, son symbole et son bord physique tournent ensemble : le bord ${EDGE_LABEL[context.sourceEdge]} rejoint ${anchorFaceId} côté ${EDGE_LABEL[context.targetEdge]}.`,
        ),
        orientationContext: context,
      };
    });
  }

  if (chapterId === 'vrai-exercice') {
    return [
      exercise(chapterId, 0, 'opposites', 'Premier geste sur une planche :', [choice('pairs', 'Relever les opposées'), choice('pieces', 'Essayer les pièces')], 'pairs', 'Les opposées imposent d’abord tous les placements certains.'),
      exercise(chapterId, 1, 'ring', 'Deux candidats restent et les opposées ne tranchent plus. Que vérifier ?', [choice('ring', 'L’anneau des voisins'), choice('shape', 'La forme du patron')], 'ring', 'L’ordre circulaire départage les deux candidats.'),
      exercise(chapterId, 2, 'orientation', 'Une face correcte touche le bon voisin avec le mauvais bord. Que manque-t-il ?', [choice('turn', 'La rotation du symbole'), choice('swap', 'Échanger les deux faces')], 'turn', 'L’identité est correcte ; seul le bord physique doit être remis du bon côté.'),
      exercise(chapterId, 3, 'full', 'Planche non chronométrée 1', [choice('puzzle', 'Ouvrir la planche')], 'puzzle', 'Résous-la lentement en suivant le chemin minimal.'),
      exercise(chapterId, 4, 'full', 'Planche non chronométrée 2', [choice('puzzle', 'Ouvrir la planche')], 'puzzle', 'La correction expliquera seulement la première déduction décisive.'),
    ];
  }

  return [
    exercise(chapterId, 0, 'timing', 'Quel ordre de phases est correct ?', [choice('order', 'Opposées → placements → anneau → orientation → contrôle'), choice('wrong', 'Orientation → hasard → contrôle')], 'order', 'La routine protège les déductions les plus rentables.'),
    exercise(chapterId, 1, 'timing', 'À 45 secondes, un dernier doute subsiste. Que faire ?', [choice('commit', 'Choisir puis contrôler'), choice('restart', 'Recommencer entièrement')], 'commit', 'Recommencer détruit les déductions déjà sûres.'),
    exercise(chapterId, 2, 'full', 'Simulation guidée de 60 secondes', [choice('start', 'Lancer')], 'start', 'Le chrono mesure la routine ; il ne remplace pas la géométrie.'),
  ];
}

export function buildCourseExercises(chapterId: string): readonly CourseExercise[] {
  const chapter = COURSE_CHAPTERS.find((candidate) => candidate.id === chapterId);
  if (!chapter) return [];
  const exercises = chapterExercises(chapterId);
  if (exercises.length !== chapter.exerciseCount) {
    throw new Error(`Chapitre ${chapterId}: ${exercises.length}/${chapter.exerciseCount} validations`);
  }
  return exercises;
}

export const ALL_COURSE_EXERCISES: readonly CourseExercise[] = COURSE_CHAPTERS.flatMap((chapter) => buildCourseExercises(chapter.id));
