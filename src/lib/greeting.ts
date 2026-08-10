/**
 * Time-of-day salutation ranges (device local hour, 0-23):
 * - 5-11   -> "Good morning"
 * - 12-16  -> "Good afternoon"
 * - 17-23 or 0-4 -> "Good evening" (wraps around midnight)
 */
function salutationForHour(hour: number): string {
  // Defensive normalization: callers should only ever pass 0-23, but keep
  // this total for any integer input (negative or >23) via modulo.
  const normalized = ((hour % 24) + 24) % 24;

  if (normalized >= 5 && normalized <= 11) {
    return 'Good morning';
  }
  if (normalized >= 12 && normalized <= 16) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

/**
 * Builds the greeting text shown in the GreetingBubble and the Dashboard
 * header: a time-of-day salutation, optionally followed by the user's
 * first name.
 *
 * Pure and total — no Date.now() calls, no side effects. Callers are
 * responsible for extracting `hour` from a Date so this stays trivially
 * testable without mocking time.
 *
 * @param hour Hour of day, 0-23 (device local time). Out-of-range values
 *   are normalized defensively via modulo.
 * @param firstName Optional first name. Undefined, empty, or
 *   whitespace-only values are treated as "no name".
 */
export function greetingFor(hour: number, firstName?: string): string {
  const salutation = salutationForHour(hour);
  const trimmedName = firstName?.trim();

  if (!trimmedName) {
    return salutation;
  }

  return `${salutation}, ${trimmedName}`;
}
