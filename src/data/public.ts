/**
 * Placeholder gate. Unconfirmed facts live in the data files as "[ADD: ...]" or
 * "[CONFIRM: ...]". Anything rendered on a public page must pass through these
 * helpers so a placeholder can never reach the HTML.
 */
const PLACEHOLDER = /\[(ADD|CONFIRM)\b/i;

export const ADD = (what: string): string => `[ADD: ${what}]`;
export const CONFIRM = (what: string): string => `[CONFIRM: ${what}]`;

export function isPlaceholder(value: unknown): boolean {
  return typeof value === "string" && PLACEHOLDER.test(value);
}

export function isPublic(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "" && !PLACEHOLDER.test(value);
}

export function publicList(values: readonly string[] | undefined): string[] {
  return (values ?? []).filter(isPublic);
}

export const SPECS_ON_REQUEST = "Full specifications on request";
