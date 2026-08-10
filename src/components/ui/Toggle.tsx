import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const toggleVariants = cva(
  // Base classes: relative container, smooth color transition, rounded pill
  'relative inline-flex cursor-pointer items-center rounded-full transition-colors',
  {
    variants: {
      size: {
        default: 'h-6 w-11', // 24px × 44px — matches original .switch dimensions
        sm: 'h-5 w-9',      // 20px × 36px
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

export interface ToggleProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof toggleVariants> {
  className?: string
}

/**
 * Accessible toggle switch with cva-driven size variants.
 *
 * Extracted from the `.switch`/`.slider` CSS pattern in App.css.
 * Uses a visually-hidden checkbox wrapped in a <label> for full
 * accessibility — screen readers announce checked/unchecked state.
 * Consumer can override any class via `className` — tailwind-merge
 * ensures consumer classes win on conflict.
 */
export function Toggle({ size, className, checked, ...props }: ToggleProps) {
  return (
    <label
      className={cn(
        toggleVariants({ size }),
        checked ? 'bg-black' : 'bg-gray-300',
        className,
      )}
    >
      <input className="sr-only peer" checked={checked} type="checkbox" {...props} />
      <span
        className={cn(
          'absolute left-0.5 top-0.5 rounded-full bg-white transition-transform',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          checked && (size === 'sm' ? 'translate-x-4' : 'translate-x-5'),
        )}
      />
    </label>
  )
}

export { toggleVariants }
