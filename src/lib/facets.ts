export const sameValue = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

export function hasValue(list: readonly string[], value: string): boolean {
  return list.some(item => sameValue(item, value));
}

export function toggleValue<T extends string>(list: readonly T[], value: T): T[] {
  return hasValue(list, value) ? list.filter(item => !sameValue(item, value)) : [...list, value];
}

export function matchesAny(selected: readonly string[], values: readonly string[]): boolean {
  return selected.length === 0 || values.some(value => hasValue(selected, value));
}

export function countValues<T>(items: readonly T[], valuesOf: (item: T) => readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const value of new Set(valuesOf(item))) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}
