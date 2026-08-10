export const VERTICAL_CAROUSEL_CONFIG = {
  /** Card top offset as a proportion of viewport HEIGHT (centered for 65vh card) */
  cardTopRatio: 0.175,
  /** Peek card (below) top offset as a proportion of viewport HEIGHT */
  peekTopRatio: 0.86,
  /** Gap between peek-above card bottom and active card top (in px) */
  peekAboveGap: 24,
  /** Navigation bar top offset as a proportion of viewport HEIGHT (Figma: 78/982 ≈ 0.05) */
  navTopRatio: 0.05,
  /** Minimum nav top offset in px */
  navTopMin: 30,
  /** Transition duration in ms */
  transitionDuration: 500,
  /** CSS easing function */
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Peek card visible height in px */
  peekHeight: 80,
  /** Reference viewport width for proportional calculations */
  referenceViewport: 1512,
  /** Reference viewport height for proportional calculations */
  referenceViewportHeight: 982,
  /** Minimum card width in px */
  minCardWidth: 288,
  /** Maximum card width in px */
  maxCardWidth: 1500,
  /** Horizontal margin on each side in px */
  horizontalMargin: 40,
  /** Mobile breakpoint */
  mobileBreakpoint: 768,
} as const

export const WIZARD_STEPS = [
  { id: 'org-type', label: 'Organizzazione' },
  { id: 'org-details', label: 'Dettagli' },
  { id: 'company-settings', label: 'Impostazioni' },
] as const

export type WizardStepId = (typeof WIZARD_STEPS)[number]['id']

export interface CardDimensions {
  width: number
  minHeight: number
  topOffset: number
  peekOffset: number
  navTopOffset: number
  padding: { horizontal: number; vertical: number }
  borderRadius: number
}

/**
 * Calculate card dimensions based on the current viewport size.
 * Vertical offsets are always proportional to viewport HEIGHT (not width)
 * so the card fills the viewport regardless of aspect ratio.
 */
export function calculateCardDimensions(viewportWidth: number, viewportHeight?: number): CardDimensions {
  const { minCardWidth, maxCardWidth, horizontalMargin, mobileBreakpoint, navTopMin } =
    VERTICAL_CAROUSEL_CONFIG

  const isMobile = viewportWidth < mobileBreakpoint
  const vH = viewportHeight ?? VERTICAL_CAROUSEL_CONFIG.referenceViewportHeight

  // Width: fill viewport with minimal margins, capped at max
  const rawWidth = viewportWidth - (isMobile ? 32 : horizontalMargin * 2)
  const width = Math.max(minCardWidth, Math.min(rawWidth, maxCardWidth))

  // Vertical offsets are always proportional to viewport height
  const topOffset = vH * VERTICAL_CAROUSEL_CONFIG.cardTopRatio
  const peekOffset = vH * VERTICAL_CAROUSEL_CONFIG.peekTopRatio
  const navTopOffset = Math.max(vH * VERTICAL_CAROUSEL_CONFIG.navTopRatio, navTopMin)

  // Min height: fill from card top to just above peek (roughly 55% of viewport)
  const minHeight = Math.max(peekOffset - topOffset - 40, 400)

  const padding = isMobile
    ? { horizontal: 20, vertical: 24 }
    : { horizontal: 56, vertical: 40 }

  const borderRadius = isMobile ? 16 : 24

  return { width, minHeight, topOffset, peekOffset, navTopOffset, padding, borderRadius }
}
