import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const cardVariants = cva(
  'relative mx-auto flex flex-col items-center rounded-3xl bg-white shadow-[0px_4px_40px_0px_rgba(0,0,0,0.1)]',
  {
    variants: {
      variant: {
        default: 'max-w-md',
        header: 'max-w-md',
        wide: 'max-w-3xl px-10 py-8 pt-20',
      },
      size: {
        default: '',
        sm: 'p-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ variant, size, className, children, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant, size }), className)} {...props}>
      {children}
    </div>
  )
}
