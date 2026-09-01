import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { buildMentalRingQuestion } from '../ringSceneModel';
import { MentalRingCorrection, MentalRingDrill } from './MentalRingDrill';

describe('MentalRingDrill', () => {
  it('ne révèle aucun voisin ni cube avant réponse au niveau mental', () => {
    const html = renderToStaticMarkup(<MentalRingDrill initialAidLevel={3} initialSeed={41} />);
    expect(html).toContain('Faire de tête');
    expect(html).toContain('Cube 3D masqué avant ta réponse');
    expect(html).not.toContain('Voisin 1');
  });

  it('révèle en correction le bon ordre calculé et le cube 3D', () => {
    const question = buildMentalRingQuestion(41);
    const html = renderToStaticMarkup(<MentalRingCorrection question={question} selectedId={question.options[1].id} />);
    expect(html).toContain(`Face centrale ${question.centerFaceId}`);
    expect(html).toContain(question.correctOrder.join(' → '));
    expect(html).toContain('Voisin 1');
  });
});
