import { describe, it, expect } from 'vitest'
import {
  VERTICAL_CAROUSEL_CONFIG,
  WIZARD_STEPS,
  calculateCardDimensions,
} from './verticalCarouselConfig'

describe('VERTICAL_CAROUSEL_CONFIG', () => {
  it('contains correct Figma reference values', () => {
    expect(VERTICAL_CAROUSEL_CONFIG.cardTopOffset).toBe(223)
    expect(VERTICAL_CAROUSEL_CONFIG.peekTopOffset).toBe(799)
    expect(VERTICAL_CAROUSEL_CONFIG.navTopOffset).toBe(78)
    expect(VERTICAL_CAROUSEL_CONFIG.transitionDuration).toBe(500)
    expect(VERTICAL_CAROUSEL_CONFIG.easing).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
    expect(VERTICAL_CAROUSEL_CONFIG.peekHeight).toBe(80)
    expect(VERTICAL_CAROUSEL_CONFIG.referenceViewport).toBe(1512)
    expect(VERTICAL_CAROUSEL_CONFIG.referenceViewportHeight).toBe(900)
    expect(VERTICAL_CAROUSEL_CONFIG.cardWidthRatio).toBe(0.887)
    expect(VERTICAL_CAROUSEL_CONFIG.minCardWidth).toBe(288)
    expect(VERTICAL_CAROUSEL_CONFIG.mobileBreakpoint).toBe(768)
  })
})

describe('WIZARD_STEPS', () => {
  it('defines exactly 3 steps in order', () => {
    expect(WIZARD_STEPS).toHaveLength(3)
    expect(WIZARD_STEPS[0]).toEqual({ id: 'org-type', label: 'Organizzazione' })
    expect(WIZARD_STEPS[1]).toEqual({ id: 'org-details', label: 'Dettagli' })
    expect(WIZARD_STEPS[2]).toEqual({
      id: 'company-settings',
      label: 'Impostazioni',
    })
  })
})

describe('calculateCardDimensions', () => {
  it('returns correct dimensions at reference viewport (1512px)', () => {
    const dims = calculateCardDimensions(1512)
    expect(dims.width).toBe(1341) // 1512 * 0.887 = 1341.144, clamped to max 1341
    expect(dims.minHeight).toBe(536)
    expect(dims.topOffset).toBe(223)
    expect(dims.peekOffset).toBe(799)
    expect(dims.navTopOffset).toBe(78)
    expect(dims.padding).toEqual({ horizontal: 40, vertical: 32 })
    expect(dims.borderRadius).toBe(24)
  })

  it('scales proportionally at 900px viewport', () => {
    const dims = calculateCardDimensions(900)
    // width: 900 * 0.887 = 798.3, below max 1341, above min 288
    expect(dims.width).toBeCloseTo(798.3, 0)
    // topOffset: 223 * 900 / 1512 ≈ 132.7
    expect(dims.topOffset).toBeCloseTo(132.7, 0)
    // peekOffset: 799 * 900 / 1512 ≈ 475.8
    expect(dims.peekOffset).toBeCloseTo(475.8, 0)
    // Desktop: navTopOffset stays fixed at 78px
    expect(dims.navTopOffset).toBe(78)
    expect(dims.padding).toEqual({ horizontal: 40, vertical: 32 })
    expect(dims.borderRadius).toBe(24)
  })

  it('clamps width to minimum 288px at very small viewports', () => {
    const dims = calculateCardDimensions(200)
    // 200 * 0.887 = 177.4, below min 288
    expect(dims.width).toBe(288)
  })

  it('uses mobile padding and border-radius below 768px', () => {
    const dims = calculateCardDimensions(375)
    expect(dims.padding).toEqual({ horizontal: 20, vertical: 24 })
    expect(dims.borderRadius).toBe(16)
  })

  it('uses desktop padding at exactly 768px', () => {
    const dims = calculateCardDimensions(768)
    expect(dims.padding).toEqual({ horizontal: 40, vertical: 32 })
    expect(dims.borderRadius).toBe(24)
  })

  it('caps width at 1341px for large viewports', () => {
    const dims = calculateCardDimensions(2000)
    // 2000 * 0.887 = 1774, capped to 1341
    expect(dims.width).toBe(1341)
  })

  it('scales vertical offsets proportionally to viewport height on mobile', () => {
    const dims = calculateCardDimensions(375, 667)
    // Mobile: topOffset = 223 * 667 / 900 ≈ 165.3
    expect(dims.topOffset).toBeCloseTo(165.3, 0)
    // Mobile: peekOffset = 799 * 667 / 900 ≈ 592.1
    expect(dims.peekOffset).toBeCloseTo(592.1, 0)
    // Mobile: navTopOffset = 78 * 667 / 900 ≈ 57.8
    expect(dims.navTopOffset).toBeCloseTo(57.8, 0)
  })

  it('uses width-based scaling on mobile when viewportHeight is not provided', () => {
    const dims = calculateCardDimensions(375)
    // Without viewportHeight, falls back to width-based scaling
    // topOffset: 223 * 375 / 1512 ≈ 55.3
    expect(dims.topOffset).toBeCloseTo(55.3, 0)
    // peekOffset: 799 * 375 / 1512 ≈ 198.3
    expect(dims.peekOffset).toBeCloseTo(198.3, 0)
    // navTopOffset: fixed at 78px when no height provided (falls through to desktop path)
    expect(dims.navTopOffset).toBe(78)
  })
})
