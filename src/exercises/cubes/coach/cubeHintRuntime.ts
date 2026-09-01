const usedBySeed = new Map<number, number>();

export function noteCubeHint(seed: number, level: number): void {
  usedBySeed.set(seed, Math.max(usedBySeed.get(seed) ?? 0, level));
}

export function consumeCubeHints(seed: number): number {
  const value = usedBySeed.get(seed) ?? 0;
  usedBySeed.delete(seed);
  return value;
}

