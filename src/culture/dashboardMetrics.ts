import type { CultureCategoryStats } from './statistics';

type CategoryCoreCounts = Pick<CultureCategoryStats, 'coreSeen' | 'coreTotal'>;

export function categoryCoreCoverageLabel(category: CategoryCoreCounts): string {
  return `${category.coreSeen}/${category.coreTotal} CORE vues`;
}

export function categoryCoreCoveragePercent(category: CategoryCoreCounts): number {
  return category.coreTotal === 0 ? 0 : Math.round(category.coreSeen / category.coreTotal * 100);
}
