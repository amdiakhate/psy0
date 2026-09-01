import { describe, expect, it } from 'vitest';
import { generate } from '../generator';
import { getCubeHint } from './cubeHints';

describe('progressive cube hints', () => {
  it('does not reveal the final symbol before level 4', () => {
    for (let seed = 0; seed < 30; seed += 1) {
      const question = generate(seed, 3, 'letters').question;
      const piece = question.pieces.find((candidate) => candidate.id === question.solution[question.holes[0]])!;
      for (const level of [1, 2, 3] as const) {
        const hint = getCubeHint(question, level);
        expect(hint.text).not.toContain(`Place ${piece.sym}`);
        expect(hint.text).not.toContain(`pieceId`);
      }
      const level4 = getCubeHint(question, 4);
      expect(level4.title).toBe('Face à repérer');
      expect(level4.highlightReferenceFaceId).toBe(piece.faceId);
      expect(level4.text).not.toContain('Place ');
    }
  });
});
