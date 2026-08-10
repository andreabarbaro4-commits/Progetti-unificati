/**
 * Tailwind spacing/sizing/typography scale conversion utilities.
 *
 * Converts pixel values to standard Tailwind scale classes or
 * arbitrary value brackets, applying a 2px snap threshold.
 */

// --- Spacing scale: step → pixel value ---
const SPACING_SCALE: ReadonlyArray<[string, number]> = [
  ['0', 0],
  ['px', 1],
  ['0.5', 2],
  ['1', 4],
  ['1.5', 6],
  ['2', 8],
  ['2.5', 10],
  ['3', 12],
  ['3.5', 14],
  ['4', 16],
  ['5', 20],
  ['6', 24],
  ['7', 28],
  ['8', 32],
  ['9', 36],
  ['10', 40],
  ['11', 44],
  ['12', 48],
  ['14', 56],
  ['16', 64],
  ['20', 80],
  ['24', 96],
  ['28', 112],
  ['32', 128],
  ['36', 144],
  ['40', 160],
  ['44', 176],
  ['48', 192],
  ['52', 208],
  ['56', 224],
  ['60', 240],
  ['64', 256],
  ['72', 288],
  ['80', 320],
  ['96', 384],
];

// --- Typography scale: class suffix → pixel value ---
const TEXT_SCALE: ReadonlyArray<[string, number]> = [
  ['xs', 12],
  ['sm', 14],
  ['base', 16],
  ['lg', 18],
  ['xl', 20],
  ['2xl', 24],
  ['3xl', 30],
  ['4xl', 36],
  ['5xl', 48],
];

// --- Leading scale: class suffix → pixel value ---
const LEADING_SCALE: ReadonlyArray<[string, number]> = [
  ['3', 12],
  ['4', 16],
  ['5', 20],
  ['6', 24],
  ['7', 28],
  ['8', 32],
  ['9', 36],
  ['10', 40],
];

/** Snap threshold in pixels. */
const SNAP_THRESHOLD = 2;

/**
 * Find the nearest scale step to a given pixel value.
 * Returns [suffix, distance] or null if scale is empty.
 */
function findNearest(
  px: number,
  scale: ReadonlyArray<[string, number]>,
): { suffix: string; distance: number } | null {
  if (scale.length === 0) return null;

  let bestSuffix = scale[0][0];
  let bestDist = Math.abs(px - scale[0][1]);

  for (let i = 1; i < scale.length; i++) {
    const dist = Math.abs(px - scale[i][1]);
    if (dist < bestDist) {
      bestDist = dist;
      bestSuffix = scale[i][0];
    }
  }

  return { suffix: bestSuffix, distance: bestDist };
}

/**
 * Checks if a string value contains calc() or CSS custom properties (var()).
 */
function isCalcOrVar(value: string): boolean {
  return /calc\s*\(/.test(value) || /var\s*\(/.test(value);
}

// --- Border/shadow/ring property prefixes that should be left unchanged ---
const SKIP_PREFIXES = [
  'border',
  'shadow',
  'ring',
  'outline',
];

/**
 * Returns true if the given prefix belongs to a property category
 * that should be left unchanged (border, shadow, ring).
 */
function shouldSkip(prefix: string): boolean {
  return SKIP_PREFIXES.some(
    (skip) => prefix === skip || prefix.startsWith(`${skip}-`),
  );
}

// ─── Public API ─────────────────────────────────────────────────────────────

export interface SpacingResult {
  /** The resolved Tailwind class (e.g., "p-4" or "p-[14px]") */
  className: string;
  /** Whether the standard scale was used (true) or arbitrary bracket (false) */
  isStandard: boolean;
}

/**
 * Convert a pixel value to a Tailwind spacing/sizing class.
 *
 * @param px - The pixel value to convert (must be a finite number ≥ 0)
 * @param prefix - The Tailwind utility prefix (e.g., "p", "m", "gap", "w", "h")
 * @returns SpacingResult with the resolved class, or null if the prefix
 *          belongs to a category that should be left unchanged (border/shadow/ring).
 *
 * @example
 * pxToSpacing(16, 'p')   // { className: 'p-4', isStandard: true }
 * pxToSpacing(14, 'p')   // { className: 'p-3.5', isStandard: true }
 * pxToSpacing(17, 'p')   // { className: 'p-[17px]', isStandard: false }
 */
export function pxToSpacing(px: number, prefix: string): SpacingResult | null {
  if (shouldSkip(prefix)) return null;

  const nearest = findNearest(px, SPACING_SCALE);
  if (!nearest) {
    return { className: `${prefix}-[${px}px]`, isStandard: false };
  }

  if (nearest.distance <= SNAP_THRESHOLD) {
    return { className: `${prefix}-${nearest.suffix}`, isStandard: true };
  }

  return { className: `${prefix}-[${px}px]`, isStandard: false };
}

export interface TypographyResult {
  /** The text-* class (e.g., "text-base" or "text-[15px]") */
  textClass: string;
  /** Whether the text class used the standard scale */
  textIsStandard: boolean;
  /** The leading-* class (e.g., "leading-6" or "leading-[22px]") */
  leadingClass: string;
  /** Whether the leading class used the standard scale */
  leadingIsStandard: boolean;
}

/**
 * Convert font-size and line-height pixel values to independent Tailwind
 * text-* and leading-* classes.
 *
 * Each mapping uses the snap threshold independently.
 *
 * @param fontSizePx - Font size in pixels
 * @param lineHeightPx - Line height in pixels
 * @returns TypographyResult with both resolved classes.
 *
 * @example
 * pxToTypography(16, 24)  // { textClass: 'text-base', ..., leadingClass: 'leading-6', ... }
 * pxToTypography(15, 22)  // { textClass: 'text-[15px]', ..., leadingClass: 'leading-[22px]', ... }
 */
export function pxToTypography(
  fontSizePx: number,
  lineHeightPx: number,
): TypographyResult {
  // Font size
  const textNearest = findNearest(fontSizePx, TEXT_SCALE);
  let textClass: string;
  let textIsStandard: boolean;

  if (textNearest && textNearest.distance <= SNAP_THRESHOLD) {
    textClass = `text-${textNearest.suffix}`;
    textIsStandard = true;
  } else {
    textClass = `text-[${fontSizePx}px]`;
    textIsStandard = false;
  }

  // Line height
  const leadingNearest = findNearest(lineHeightPx, LEADING_SCALE);
  let leadingClass: string;
  let leadingIsStandard: boolean;

  if (leadingNearest && leadingNearest.distance <= SNAP_THRESHOLD) {
    leadingClass = `leading-${leadingNearest.suffix}`;
    leadingIsStandard = true;
  } else {
    leadingClass = `leading-[${lineHeightPx}px]`;
    leadingIsStandard = false;
  }

  return { textClass, textIsStandard, leadingClass, leadingIsStandard };
}

/**
 * Process a raw CSS value string (which may contain calc(), var(), or a plain px value).
 * Returns the value unchanged if it contains calc()/var(), or converts it.
 *
 * @param value - The raw CSS value string (e.g., "16px", "calc(100% - 16px)", "var(--spacing)")
 * @param prefix - The Tailwind utility prefix
 * @returns The original string unchanged if it contains calc()/var(),
 *          or the SpacingResult from conversion, or null if the prefix should be skipped.
 */
export function processValue(
  value: string,
  prefix: string,
): string | SpacingResult | null {
  // Leave calc() and CSS custom property values unchanged
  if (isCalcOrVar(value)) {
    return value;
  }

  // Attempt to extract a numeric px value
  const match = value.match(/^(-?\d+(?:\.\d+)?)\s*px$/i);
  if (!match) {
    // Not a simple px value — return unchanged
    return value;
  }

  const px = parseFloat(match[1]);
  return pxToSpacing(px, prefix);
}
