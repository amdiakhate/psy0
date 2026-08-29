export function reinsertWithinPassageLimit<T>(queue: T[], item: T, currentIndex: number): T[] {
  if (currentIndex >= queue.length - 1) return queue;
  return [...queue.slice(0, -1), item];
}
