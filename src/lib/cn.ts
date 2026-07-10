/**
 * Lightweight className combiner.
 * Filters out falsy values and joins with a single space — no external deps.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
