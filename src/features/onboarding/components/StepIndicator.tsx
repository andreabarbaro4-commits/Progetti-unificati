interface StepIndicatorProps {
  /** When true, indicates there's a next card ahead (first dot big/black, second small/grey).
   *  When false, it's the last card (first dot small/grey, second big/black). */
  hasNext: boolean
}

/**
 * Two-dot step indicator with smooth transitions.
 * - hasNext=true:  [━━━ ·]  (big black + small grey)
 * - hasNext=false: [· ━━━]  (small grey + big black)
 */
export function StepIndicator({ hasNext }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 pt-6 pb-2">
      <div
        className="h-1 rounded-full transition-all duration-300 ease-in-out"
        style={{
          width: hasNext ? '24px' : '8px',
          backgroundColor: hasNext ? '#000' : 'rgba(0,0,0,0.3)',
        }}
      />
      <div
        className="h-1 rounded-full transition-all duration-300 ease-in-out"
        style={{
          width: hasNext ? '8px' : '24px',
          backgroundColor: hasNext ? 'rgba(0,0,0,0.3)' : '#000',
        }}
      />
    </div>
  )
}
