/**
 * Generic, reusable file-acceptance validator.
 *
 * Per the design document's "Property 42: File-acceptance validator rejects
 * with a reason matching the violated rule, preserving prior state" template,
 * this is the single named utility every file-accepting surface (Documents
 * tab's AddDocumentDialog — Requirements 25.2, 25.3; AI Chat attachments —
 * Requirements 30.1-30.5; the personal photo gallery Widget — Requirement
 * 12.4) uses to decide whether a candidate file may be accepted, rather than
 * each call site reimplementing its own size/type/capacity checks inline.
 *
 * This function itself never mutates anything — it only reports whether a
 * file should be accepted and, if not, why. "Preserving prior state" (per
 * the property's name) is a consequence of this function being pure: a
 * caller that only adds the file to its collection/form state when
 * `accepted: true` automatically leaves that state untouched on rejection,
 * including any partially-entered metadata (e.g. a document's name override
 * or milestone/task selections) that lives outside this function entirely.
 */

/**
 * The rules a candidate file is checked against. All fields are optional —
 * a call site only supplies the rules relevant to its surface (e.g. the
 * Documents tab only cares about `maxSizeBytes`, while the photo gallery
 * cares about all three).
 */
export interface FileAcceptanceRules {
  /** Maximum allowed file size, in bytes. Omit to allow any size. */
  maxSizeBytes?: number;
  /** Allowed MIME types (e.g. `['image/jpeg', 'image/png']`). Omit to allow any type. */
  allowedTypes?: string[];
  /** Maximum number of items the target collection may hold. Omit for no cap. */
  maxCollectionSize?: number;
}

/**
 * The minimal shape this validator needs from a candidate file. Deliberately
 * narrower than the browser's `File`/`Blob` types so this function (and its
 * tests) never need to construct real `File`/`Blob` objects — a real `File`
 * instance already satisfies `FileLike` structurally, so this stays a
 * drop-in check at every real call site while remaining trivially
 * unit-testable with plain object literals.
 */
export interface FileLike {
  size: number;
  type: string;
}

/** The current state of the collection the candidate file would join. */
export interface FileCollectionState {
  /** The number of items already present in the target collection. */
  currentCount: number;
}

export type FileAcceptanceResult =
  | { accepted: true }
  | { accepted: false; reason: 'tooLarge' | 'unsupportedType' | 'collectionFull' };

/**
 * Validates whether `file` may be accepted into a collection governed by
 * `rules`, given the collection's current state.
 *
 * Checks are applied in a fixed order — capacity, then type, then size —
 * so that when a candidate file violates more than one rule at once, the
 * reason reported is deterministic rather than depending on the order
 * `rules` fields happen to be set. Capacity is checked first because it
 * does not depend on the file at all: a full collection rejects every
 * candidate regardless of its type or size, so surfacing "collectionFull"
 * first avoids reporting a misleading type/size-specific reason for a file
 * that was never going to fit in the first place.
 *
 * Pure and total: never throws, never mutates `file`, `rules`, or
 * `collectionState`, for any input (including missing/undefined rule
 * fields, zero/negative sizes, or an empty `allowedTypes` list).
 *
 * @param file The candidate file (or any `{ size, type }`-shaped value).
 * @param rules The acceptance rules to validate against.
 * @param collectionState The target collection's current state.
 * @returns `{ accepted: true }`, or `{ accepted: false, reason }` identifying
 * the first violated rule.
 */
export function validateFileAcceptance(
  file: FileLike,
  rules: FileAcceptanceRules,
  collectionState: FileCollectionState,
): FileAcceptanceResult {
  if (
    rules.maxCollectionSize !== undefined &&
    collectionState.currentCount >= rules.maxCollectionSize
  ) {
    return { accepted: false, reason: 'collectionFull' };
  }

  if (rules.allowedTypes !== undefined && !rules.allowedTypes.includes(file.type)) {
    return { accepted: false, reason: 'unsupportedType' };
  }

  if (rules.maxSizeBytes !== undefined && file.size > rules.maxSizeBytes) {
    return { accepted: false, reason: 'tooLarge' };
  }

  return { accepted: true };
}
