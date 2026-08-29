import { describe, expect, it } from 'vitest';
import { reinsertWithinPassageLimit } from './sessionQueue';

describe('file de session Culture J-5', () => {
  it('réinsère une erreur sans dépasser les 30 passages prévus', () => {
    const queue = Array.from({ length: 30 }, (_, index) => index);
    const next = reinsertWithinPassageLimit(queue, queue[2], 2);
    expect(next).toHaveLength(30);
    expect(next.at(-1)).toBe(2);
    expect(next).not.toContain(29);
  });

  it('ne dépasse pas la limite si la dernière question est fausse', () => {
    const queue = Array.from({ length: 30 }, (_, index) => index);
    expect(reinsertWithinPassageLimit(queue, queue[29], 29)).toEqual(queue);
  });
});
