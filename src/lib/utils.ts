export type ClassValue = string | number | null | false | undefined;

/** Minimal class joiner — no runtime dependency. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
