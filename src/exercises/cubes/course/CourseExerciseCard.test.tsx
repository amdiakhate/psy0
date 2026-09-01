import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { buildCourseExercises } from './courseDrills';
import { CourseExerciseCard } from './CourseExerciseCard';

describe('CourseExerciseCard', () => {
  it('montre le carré, le bord de départ, la face et le voisin propres à chaque validation d’orientation', () => {
    const edgeLabel = { top: 'haut', right: 'droite', bottom: 'bas', left: 'gauche' } as const;
    const exercises = buildCourseExercises('orientation-symboles');
    for (const exercise of exercises) {
      const context = exercise.orientationContext!;
      const html = renderToStaticMarkup(<CourseExerciseCard exercise={exercise} onRecorded={() => undefined} />);
      expect(html).toContain('1 · Départ réel');
      expect(html).toContain('2 · Patron cible');
      expect(html).toContain(`Face ${context.faceId} avec son bord ${edgeLabel[context.sourceEdge]} rouge`);
      expect(html).toContain(`même voisin <strong>${context.anchorFaceId}</strong>`);
      expect(html).toContain('Le trait rouge est le bord physique de départ');
    }
  });
});
