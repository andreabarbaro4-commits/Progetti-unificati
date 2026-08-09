interface StepIndicatorProps {
  total: number
  current: number
}

export function StepIndicator({ total, current }: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`step-indicator-dot${index === current ? ' active' : ''}`}
        />
      ))}
    </div>
  )
}
