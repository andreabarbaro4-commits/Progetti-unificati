import { cn } from '../../lib/utils'
import { FlowleeLogo } from './FlowleeLogo'
import { VERTICAL_CAROUSEL_CONFIG, calculateCardDimensions } from '../../features/onboarding/components/verticalCarouselConfig'
import arrowUpSvg from '../../assets/arrow-up.svg'
import arrowDownSvg from '../../assets/arrow-down.svg'
import chevronDownSvg from '../../assets/chevron-down.svg'

export interface TopNavigationBarProps {
  /** 0-based index of the currently active step (omit for simple mode) */
  activeStep?: number
  /** Total number of steps in the wizard (omit for simple mode) */
  totalSteps?: number
  /** Step labels for display (omit for simple mode) */
  stepLabels?: string[]
  /** Called when user clicks the back (previous) arrow */
  onBack?: () => void
  /** Called when user clicks the forward (next) arrow */
  onForward?: () => void
  /** Whether a transition is in progress (disables navigation) */
  isTransitioning?: boolean
  /**
   * Positioning variant:
   * - 'absolute': original behavior — absolute positioned with viewport-proportional top offset (for onboarding carousel)
   * - 'inline': renders in normal document flow with margin (for AppShell)
   */
  variant?: 'absolute' | 'inline'
}

/**
 * Unified top navigation bar used across the onboarding flow.
 *
 * Supports two modes:
 * - **Simple mode**: arrows + logo + user avatar (no step labels).
 *   Used during registration steps.
 * - **Step mode**: arrows + step label + logo + user avatar.
 *   Used during the company creation wizard.
 *
 * Mode is determined automatically — if `stepLabels` is provided, step mode is used.
 */
export function TopNavigationBar({
  activeStep = 0,
  totalSteps = 1,
  stepLabels,
  onBack,
  onForward,
  isTransitioning = false,
  variant = 'absolute',
}: TopNavigationBarProps) {
  const isStepMode = !!stepLabels && stepLabels.length > 0

  const isFirstStep = activeStep === 0
  const isLastStep = activeStep === totalSteps - 1

  const backDisabled = isFirstStep || isTransitioning || !onBack
  const forwardDisabled = isLastStep || isTransitioning || !onForward

  const stepLabel = isStepMode
    ? `${stepLabels[activeStep]} / Accesso diretto`
    : undefined

  // Calculate scaled nav offset (only used in absolute mode)
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : VERTICAL_CAROUSEL_CONFIG.referenceViewport
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : VERTICAL_CAROUSEL_CONFIG.referenceViewportHeight
  const dimensions = calculateCardDimensions(viewportWidth, viewportHeight)
  const navPaddingTop = dimensions.navTopOffset

  const isInline = variant === 'inline'

  return (
    <div
      className={cn(
        'vertical-carousel-nav-bar flex items-center pl-3 pr-1.5 md:pl-4 md:pr-2 bg-white rounded-[1.5rem] shadow-[0px_4px_40px_0px_rgba(0,0,0,0.1)]',
        !isInline && 'absolute left-1/2 -translate-x-1/2 z-50',
        isInline && 'relative mx-auto z-50',
      )}
      style={isInline
        ? {
            height: '3rem',
            width: '100%',
            maxWidth: '93.75rem',
            minWidth: '18rem',
            margin: '0.625rem auto',
          }
        : {
            top: `${navPaddingTop / 16}rem`,
            height: '3rem',
            width: `calc(100vw - 5rem)`,
            maxWidth: '93.75rem',
            minWidth: '18rem',
          }
      }
    >
      {/* Left section: navigation arrows + optional step label */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous step"
            disabled={backDisabled}
            onClick={backDisabled ? undefined : onBack}
            className={cn(
              'w-6 h-6 flex items-center justify-center transition-opacity opacity-[0.15]',
              backDisabled ? 'pointer-events-none cursor-default' : 'cursor-pointer hover:opacity-40'
            )}
          >
            <img src={arrowUpSvg} alt="" className="w-6 h-6" />
          </button>
          <button
            type="button"
            aria-label="Next step"
            disabled={forwardDisabled}
            onClick={forwardDisabled ? undefined : onForward}
            className={cn(
              'w-6 h-6 flex items-center justify-center transition-opacity opacity-[0.15]',
              forwardDisabled ? 'pointer-events-none cursor-default' : 'cursor-pointer hover:opacity-40'
            )}
          >
            <img src={arrowDownSvg} alt="" className="w-6 h-6" />
          </button>
        </div>
        {stepLabel && (
          <span className="text-base text-black whitespace-nowrap">{stepLabel}</span>
        )}
      </div>

      {/* Center section: Flowlee logo (absolutely centered in navbar) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <FlowleeLogo />
      </div>

      {/* Spacer to push right section to the end */}
      <div className="flex-1" />

      {/* Right section: user name + chevron + avatar */}
      <div className="flex items-center gap-2">
        <span className="text-base text-black hidden md:inline">Flavio</span>
        <img src={chevronDownSvg} alt="" className="w-3 h-3 hidden md:block" />
        <div className="w-9 h-9 rounded-full border-[1.5px] border-black/20 flex items-center justify-center overflow-hidden bg-gray-100">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
