import type React from 'react'
import { cn } from '../../lib/utils'

export interface ZoomButtonProps {
  title: string
  onClick: () => void
  children: React.ReactNode
  className?: string
}

/**
 * Small square icon button for the Member_Graph viewport controls
 * (zoom in / zoom out / reset). Adapted from
 * ../demo/src/components/forceGraph/ZoomButton.tsx using this repo's
 * `cn` helper instead of inline styles; keeps the demo's stopPropagation
 * behavior so clicking a control never triggers a canvas pan.
 */
export function ZoomButton({ title, onClick, children, className }: ZoomButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-lg border border-indigo-100 bg-white text-base font-bold leading-none text-indigo-700 shadow-[0_1px_6px_rgba(0,0,0,0.1)] transition-colors hover:bg-indigo-50',
        className,
      )}
    >
      {children}
    </button>
  )
}
