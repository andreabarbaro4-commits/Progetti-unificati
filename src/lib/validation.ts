/**
 * Generic, reusable string-length validator.
 *
 * Per the design document's "Property 18: Required-string-length validation
 * is a total predicate" template, this is the single named utility every
 * length-constrained text field (project name, client name, project brief,
 * chat messages, milestone/task names, admin required fields, etc.) uses
 * for its own validation, rather than each dialog/form reimplementing the
 * same required/min/max checks inline with potentially inconsistent
 * semantics.
 *
 * This is intentionally a plain, framework-agnostic function — later
 * dialog tasks build `zod` schemas (`z.string().trim().min().max()`) on
 * top of the same rule shape for react-hook-form wiring; this function
 * itself has no `zod`/react-hook-form dependency so it stays trivially
 * unit-testable and reusable outside of form contexts (e.g. mock-mode
 * bypass checks, admin CRUD handlers).
 */

export interface StringLengthRules {
  /** Whether an empty (or whitespace-only) value is rejected. Defaults to false. */
  required?: boolean;
  /** Minimum trimmed length required, when the value is non-empty. */
  minLength?: number;
  /** Maximum trimmed length allowed. */
  maxLength?: number;
}

export type StringLengthValidationResult =
  | { valid: true }
  | { valid: false; reason: 'required' | 'tooShort' | 'tooLong' };

/**
 * Validates `value` against `rules`. Always returns a result — never
 * throws — for any string/rules combination.
 *
 * Semantics:
 * - The value is trimmed before every length/emptiness check (whitespace-
 *   only counts as empty), consistent with how `greetingFor`/form fields
 *   elsewhere in this repo treat trimmed input as the canonical value.
 * - `required: true` + empty (post-trim) value → `{ reason: 'required' }`.
 * - `required` false/omitted + empty (post-trim) value → always valid.
 *   An optional field that was intentionally left blank has no length to
 *   violate; `minLength` only constrains a value the user actually
 *   provided, not the decision to omit an optional field entirely. (If a
 *   call site wants to *force* a minimum-length value whenever any
 *   non-empty value is provided to an optional field, that already falls
 *   out of the `tooShort` check below once the value is non-empty.)
 * - Otherwise, `minLength`/`maxLength` (when specified) are checked
 *   against the trimmed length, in that order — `tooShort` takes
 *   precedence over `tooLong` since a value can't fail both.
 */
export function validateStringLength(
  value: string,
  rules: StringLengthRules,
): StringLengthValidationResult {
  const trimmed = value.trim();
  const isEmpty = trimmed.length === 0;

  if (rules.required && isEmpty) {
    return { valid: false, reason: 'required' };
  }

  // An optional field left empty has nothing further to validate — there's
  // no "too short" violation for a value the user chose not to provide.
  if (isEmpty) {
    return { valid: true };
  }

  if (rules.minLength !== undefined && trimmed.length < rules.minLength) {
    return { valid: false, reason: 'tooShort' };
  }

  if (rules.maxLength !== undefined && trimmed.length > rules.maxLength) {
    return { valid: false, reason: 'tooLong' };
  }

  return { valid: true };
}
