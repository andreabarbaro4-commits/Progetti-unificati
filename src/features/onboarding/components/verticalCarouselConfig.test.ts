import { describe, it, expect } from 'vitest'
import {
  VERTICAL_CAROUSEL_CONFIG,
  WIZARD_STEPS,
  calculateCardDimensions,
} from './verticalCarouselConfig'

describe('VERTICAL_CAROUSEL_CONFIG', () => {
  it('contains correct layout ratios and constants', () => {
    expect(VERTICAL_CAROUSEL_CONFIG.cardTopRatio).toBe(0.175)
    expect(VERTICAL_CAROUSEL_CONFIG.peekTopRatio).toBe(0.86)
    expect(VERTICAL_CAROUSEL_CONFIG.peekAboveGap).toBe(24)
    expect(VERTICAL_CAROUSEL_CONFIG.navTopRatio).toBe(0.05)
    expect(VERTICAL_CAROUSEL_CONFIG.navTopMin).toBe(30)
    expect(VERTICAL_CAROUSEL_CONFIG.transitionDuration).toBe(500)
    expect(VERTICAL_CAROUSEL_CONFIG.easing).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
    expect(VERTICAL_CAROUSEL_CONFIG.peekHeight).toBe(80)
    expect(VERTICAL_CAROUSEL_CONFIG.referenceViewport).toBe(1512)
    expect(VERTICAL_CAROUSEL_CONFIG.referenceViewportHeight).toBe(982)
    expect(VERTICAL_CAROUSEL_CONFIG.minCardWidth).toBe(288)
    expect(VERTICAL_CAROUSEL_CONFIG.maxCardWidth).toBe(1500)
    expect(VERTICAL_CAROUSEL_CONFIG.horizontalMargin).toBe(40)
    expect(VERTICAL_CAROUSEL_CONFIG.mobileBreakpoint).toBe(768)
  })
})

describe('WIZARD_STEPS', () => {
  it('defines exactly 3 steps in order', () => {
    expect(WIZARD_STEPS).toHaveLength(3)
    expect(WIZARD_STEPS[0]).toEqual({ id: 'org-type', label: 'Organizzazione' })
    expect(WIZARD_STEPS[1]).toEqual({ id: 'org-details', label: 'Dettagli' })
    expect(WIZARD_STEPS[2]).toEqual({
      id: 'contact-info',
      label: 'Contatti',
    })
  })
})

describe('calculateCardDimensions', () => {
  it('returns correct dimensions at reference viewport (1512px width, 982px height)', () => {
    const dims = calculateCardDimensions(1512, 982)
    // width: 1512 - 80 = 1432, clamped to max 1500 -> 1432
    expect(dims.width).toBe(1432)
    // topOffset: 982 * 0.175 = 171.85
    expect(dims.topOffset).toBeCloseTo(171.85, 1)
    // peekOffset: 982 * 0.86 = 844.52
    expect(dims.peekOffset).toBeCloseTo(844.52, 1)
    // navTopOffset: max(982 * 0.05, 30) = max(49.1, 30) = 49.1
    expect(dims.navTopOffset).toBeCloseTo(49.1, 1)
    // minHeight: max(844.52 - 171.85 - 40, 400) = max(632.67, 400) = 632.67
    expect(dims.minHeight).toBeCloseTo(632.67, 0)
    expect(dims.padding).toEqual({ horizontal: 56, vertical: 40 })
    expect(dims.borderRadius).toBe(24)
  })

  it('uses default referenceViewportHeight when viewportHeight not provided', () => {
    const dims = calculateCardDimensions(1512)
    // Uses referenceViewportHeight (982) as vH
    // topOffset: 982 * 0.175 = 171.85
    expect(dims.topOffset).toBeCloseTo(171.85, 1)
    // peekOffset: 982 * 0.86 = 844.52
    expect(dims.peekOffset).toBeCloseTo(844.52, 1)
  })

  it('scales width proportionally at 900px viewport', () => {
    const dims = calculateCardDimensions(900, 700)
    // width: 900 - 80 = 820, within [288, 1500]
    expect(dims.width).toBe(820)
    // topOffset: 700 * 0.175 = 122.5
    expect(dims.topOffset).toBeCloseTo(122.5, 1)
    // peekOffset: 700 * 0.86 = 602
    expect(dims.peekOffset).toBeCloseTo(602, 1)
    // navTopOffset: max(700 * 0.05, 30) = max(35, 30) = 35
    expect(dims.navTopOffset).toBeCloseTo(35, 1)
    expect(dims.padding).toEqual({ horizontal: 56, vertical: 40 })
    expect(dims.borderRadius).toBe(24)
  })

  it('clamps width to minimum 288px at very small viewports', () => {
    const dims = calculateCardDimensions(200, 400)
    // width: 200 - 32 (mobile margins) = 168, clamped to min 288
    expect(dims.width).toBe(288)
  })

  it('uses mobile padding and border-radius below 768px', () => {
    const dims = calculateCardDimensions(375, 667)
    expect(dims.padding).toEqual({ horizontal: 20, vertical: 24 })
    expect(dims.borderRadius).toBe(16)
  })

  it('uses desktop padding at exactly 768px', () => {
    const dims = calculateCardDimensions(768, 1024)
    expect(dims.padding).toEqual({ horizontal: 56, vertical: 40 })
    expect(dims.borderRadius).toBe(24)
  })

  it('caps width at maxCardWidth for large viewports', () => {
    const dims = calculateCardDimensions(2000, 1200)
    // width: 2000 - 80 = 1920, capped to 1500
    expect(dims.width).toBe(1500)
  })

  it('navTopOffset respects navTopMin floor', () => {
    // With a very small viewport height, navTopRatio * height could be < 30
    const dims = calculateCardDimensions(500, 400)
    // navTopOffset: max(400 * 0.05, 30) = max(20, 30) = 30
    expect(dims.navTopOffset).toBe(30)
  })

  it('minHeight does not go below 400', () => {
    // Very small viewport height where peekOffset - topOffset - 40 < 400
    const dims = calculateCardDimensions(500, 300)
    // topOffset: 300 * 0.175 = 52.5
    // peekOffset: 300 * 0.86 = 258
    // minHeight: max(258 - 52.5 - 40, 400) = max(165.5, 400) = 400
    expect(dims.minHeight).toBe(400)
  })
})
