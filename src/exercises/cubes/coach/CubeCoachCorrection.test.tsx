import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { generate, type CubesAnswer } from '../generator';
import { CubeCoachCorrection } from './CubeCoachCorrection';

describe('CubeCoachCorrection progressive disclosure', () => {
  it('shows the first error and the targeted rotation action before the full solution', () => {
    const item = generate(9_137, 3, 'letters');
    const answer: CubesAnswer = Object.fromEntries(item.question.holes.map((hole) => [hole, {
      pieceId: item.question.solution[hole],
      rot: (item.question.expectedRot[hole] + 1) % 4,
    }]));
    const html = renderToStaticMarkup(<CubeCoachCorrection item={item} answer={answer} />);
    expect(html).toContain('Première erreur');
    expect(html).toContain('Pourquoi cette face tourne ?');
    expect(html).toContain('Comprendre en détail');
    expect(html).not.toContain('Le chemin le plus court sur cette planche');
    expect(html).not.toContain('label="Solution"');
  });
});

