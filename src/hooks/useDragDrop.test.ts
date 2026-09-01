import { describe, expect, it } from 'vitest';
import { dragThresholdExceeded } from './useDragDrop';

describe('seuil du glisser-déposer', () => {
  it('mesure tous les déplacements depuis le point de départ', () => {
    const origin = { x: 100, y: 100 };
    expect(dragThresholdExceeded(origin, { x: 103, y: 100 })).toBe(false);
    expect(dragThresholdExceeded(origin, { x: 106, y: 100 })).toBe(true);
  });

  it('détecte aussi un déplacement diagonal', () => {
    expect(dragThresholdExceeded({ x: 0, y: 0 }, { x: 3, y: 3 })).toBe(true);
  });
});
