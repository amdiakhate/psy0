import type { Cube, FaceEdge, QuarterTurn } from '../domain/types';

export type CourseFaceId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type CubeCourseSkill =
  | 'identity'
  | 'opposites'
  | 'adjacency'
  | 'belt'
  | 'recenter'
  | 'ring'
  | 'mirror'
  | 'orientation'
  | 'full'
  | 'timing';

export interface CubeCourseChapter {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  skills: readonly CubeCourseSkill[];
  threshold: number;
  exerciseCount: number;
}

export interface CourseChoice {
  id: string;
  label: string;
}

export interface CourseExercise {
  id: string;
  chapterId: string;
  skill: CubeCourseSkill;
  prompt: string;
  choices: readonly CourseChoice[];
  answerId: string;
  explanation: string;
  orientationContext?: {
    originalCube: Cube;
    targetCube: Cube;
    faceId: CourseFaceId;
    anchorFaceId: CourseFaceId;
    sourceEdge: FaceEdge;
    targetEdge: FaceEdge;
    referenceRot: QuarterTurn;
  };
}

export const COURSE_CHAPTERS: readonly CubeCourseChapter[] = [
  { id: 'comprendre-le-patron', order: 1, title: 'Comprendre le patron', shortTitle: 'Patron', description: 'Suivre une même face du patron plat au cube fermé.', skills: ['identity'], threshold: 1, exerciseCount: 3 },
  { id: 'faces-opposees', order: 2, title: 'Faces opposées', shortTitle: 'Opposées', description: 'Reconnaître les trois paires qui ne se touchent jamais.', skills: ['opposites'], threshold: 1, exerciseCount: 5 },
  { id: 'faces-adjacentes', order: 3, title: 'Faces adjacentes', shortTitle: 'Voisines', description: 'Lire les arêtes réellement partagées.', skills: ['adjacency'], threshold: 0.9, exerciseCount: 4 },
  { id: 'ceinture', order: 4, title: 'La ceinture', shortTitle: 'Ceinture', description: 'Voir la bande A–B–C–D se refermer.', skills: ['belt', 'adjacency'], threshold: 0.9, exerciseCount: 3 },
  { id: 'changer-de-centre', order: 5, title: 'Changer de face centrale', shortTitle: 'Recentrer', description: 'Redéplier le même cube autour de n’importe quelle face.', skills: ['recenter', 'identity'], threshold: 0.8, exerciseCount: 3 },
  { id: 'anneau-des-voisins', order: 6, title: 'Anneau des voisins', shortTitle: 'Anneau', description: 'Conserver l’ordre circulaire autour d’une face.', skills: ['ring'], threshold: 0.8, exerciseCount: 4 },
  { id: 'rotation-ou-miroir', order: 7, title: 'Rotation ou miroir', shortTitle: 'Miroir', description: 'Distinguer une rotation possible d’un ordre inversé.', skills: ['mirror', 'ring'], threshold: 0.8, exerciseCount: 4 },
  { id: 'orientation-symboles', order: 8, title: 'Orientation des symboles', shortTitle: 'Orientation', description: 'Suivre un bord physique pendant que la face tourne.', skills: ['orientation'], threshold: 0.8, exerciseCount: 5 },
  { id: 'vrai-exercice', order: 9, title: 'Résoudre le vrai exercice', shortTitle: 'Planches', description: 'Appliquer la méthode sur de vraies planches sans chrono.', skills: ['opposites', 'ring', 'orientation', 'full'], threshold: 0.8, exerciseCount: 5 },
  { id: 'methode-chrono', order: 10, title: 'Méthode chrono PSY0', shortTitle: 'Chrono', description: 'Organiser les 60 secondes seulement une fois la méthode acquise.', skills: ['timing', 'full'], threshold: 0.8, exerciseCount: 3 },
] as const;

export function getCourseChapter(chapterId: string): CubeCourseChapter | undefined {
  return COURSE_CHAPTERS.find((chapter) => chapter.id === chapterId);
}
