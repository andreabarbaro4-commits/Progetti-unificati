import { useCallback, useEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const modalVariants = cva(
  // Base classes matching Card's rounded/shadow token pattern
  'relative flex w-full flex-col rounded-3xl bg-white shadow-[0px_4px_40px_0px_rgba(0,0,0,0.1)] outline-none max-h-[90vh] overflow-y-auto p-6',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export interface ModalProps extends VariantProps<typeof modalVariants> {
  /** Controls whether the modal is rendered at all. */
  open: boolean
  /** Invoked on Escape, backdrop click, or programmatic dismissal. */
  onClose: () => void
  /** When true, Escape and backdrop-click dismissal are disabled (e.g. while submitting). */
  disableDismiss?: boolean
  /** `aria-label` for the dialog (use when there is no visible heading to reference). */
  ariaLabel?: string
  /** `aria-labelledby` target id for the dialog (use when a visible heading exists). */
  ariaLabelledBy?: string
  /** Extra classes for the dialog content panel (merged via `cn`). */
  className?: string
  /** Extra classes for the backdrop wrapper. */
  backdropClassName?: string
  children?: ReactNode
}

/**
 * Accessible modal dialog primitive.
 *
 * Behavior (focus trap, Escape dismiss, backdrop-click dismiss, focus-return
 * to the previously-focused element) is ported 1:1 from Demo's `ModalOverlay`.
 * Visuals are rebuilt as a `cva`-driven component using this repo's
 * rounded/shadow tokens (matching `Card`'s `rounded-3xl shadow-[...]` pattern),
 * and it accepts `className` for `cn()`-based overrides like every other
 * `ui/` component.
 */
export function Modal({
  open,
  onClose,
  disableDismiss = false,
  ariaLabel,
  ariaLabelledBy,
  size,
  className,
  backdropClassName,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Capture the element that had focus when the modal opened
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null
    }
  }, [open])

  // Move focus to the first focusable element on open
  useEffect(() => {
    if (!open) return

    const raf = requestAnimationFrame(() => {
      const dialog = dialogRef.current
      if (!dialog) return

      const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusable.length > 0) {
        focusable[0].focus()
      } else {
        dialog.focus()
      }
    })

    return () => cancelAnimationFrame(raf)
  }, [open])

  // Return focus to the trigger element on close
  useEffect(() => {
    if (!open && triggerRef.current) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [open])

  // Escape key dismiss
  useEffect(() => {
    if (!open) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableDismiss) {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, disableDismiss, onClose])

  // Focus trap: keep Tab/Shift+Tab cycling within the dialog
  const handleKeyDown = useCallback((e: ReactKeyboardEvent) => {
    if (e.key !== 'Tab') return

    const dialog = dialogRef.current
    if (!dialog) return

    const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [])

  // Backdrop click dismiss (ignore clicks that originate inside the panel)
  const handleBackdropClick = useCallback(
    (e: ReactMouseEvent) => {
      if (e.target === e.currentTarget && !disableDismiss) {
        onClose()
      }
    },
    [disableDismiss, onClose]
  )

  if (!open) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm',
        backdropClassName
      )}
      role="presentation"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        className={cn(modalVariants({ size }), className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export { modalVariants }
