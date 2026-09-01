import type { Item } from '../../../core/types';
import { generate, type CubesQuestion } from '../generator';
import { buildReasoningPath, type ReasoningPath } from '../domain/reasoningPath';

export type GuidedFixtureKind = 'opposites' | 'two-candidates' | 'orientation';

export interface GuidedFixture {
  kind: GuidedFixtureKind;
  item: Item<CubesQuestion>;
  path: ReasoningPath;
}

const cache = new Map<GuidedFixtureKind, GuidedFixture>();

function matches(kind: GuidedFixtureKind, path: ReasoningPath): boolean {
  const kinds = path.minimalSteps.map((step) => step.kind);
  if (kind === 'opposites') {
    return kinds.filter((step) => step === 'opposite-deduction').length >= 2
      && !kinds.includes('two-candidates') && !kinds.includes('ring-comparison');
  }
  if (kind === 'two-candidates') {
    const two = kinds.indexOf('two-candidates');
    const ring = kinds.indexOf('ring-comparison');
    return two >= 0 && ring > two;
  }
  return kinds.filter((step) => step === 'orientation-anchor').length >= 2;
}

export function getGuidedFixture(kind: GuidedFixtureKind): GuidedFixture {
  const cached = cache.get(kind);
  if (cached) return cached;
  for (let seed = 9_000; seed < 20_000; seed += 1) {
    const item = generate(seed, 3, 'letters');
    const path = buildReasoningPath(item.question);
    if (!matches(kind, path)) continue;
    const fixture = { kind, item, path } satisfies GuidedFixture;
    cache.set(kind, fixture);
    return fixture;
  }
  throw new Error(`Aucune planche guidée trouvée pour ${kind}`);
}
