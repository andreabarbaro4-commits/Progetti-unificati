import type { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  // Base classes (always applied)
  'inline-flex items-center justify-center rounded-full font-semibold transition-all cursor-pointer border-none min-h-11 md:min-h-0',
  {
    variants: {
      variant: {
        primary: 'bg-black text-white hover:bg-gray-800',
        secondary: 'bg-transparent border border-gray-200 text-black hover:bg-gray-50',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
      },
      size: {
        default: 'px-7 py-2.5 text-sm',
        sm: 'px-4 py-1.5 text-xs',
        lg: 'px-9 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/**
 * Pill-shaped button with cva-driven variants.
 *
 * Consumer can override any class via `className` — tailwind-merge ensures
 * consumer classes win on conflict.
 */
export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
}

export { buttonVariants }
