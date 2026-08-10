import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { useWizardStore } from './useWizardStore';

const severityIndicatorVariants = cva(
  'inline-block h-2.5 w-2.5 shrink-0 rounded-full',
  {
    variants: {
      severity: {
        high: 'bg-red-500',
        medium: 'bg-amber-500',
        low: 'bg-yellow-400',
      },
    },
    defaultVariants: {
      severity: 'low',
    },
  }
);

type Severity = 'high' | 'medium' | 'low';

interface SeverityIndicatorProps extends VariantProps<typeof severityIndicatorVariants> {
  severity: Severity;
  className?: string;
}

function SeverityIndicator({ severity, className }: SeverityIndicatorProps) {
  return (
    <span
      className={cn(severityIndicatorVariants({ severity }), className)}
      aria-label={`${severity} severity`}
    />
  );
}

export interface RiskListProps {
  className?: string;
}

/**
 * Displays project risks from the wizard store's analysis data.
 * Each risk has a visually distinguishable severity indicator (high/medium/low)
 * rendered as colored dots — red for high, orange for medium, yellow for low.
 */
export function RiskList({ className }: RiskListProps) {
  const risks = useWizardStore((s) => s.analysis?.risks ?? []);

  if (risks.length === 0) {
    return (
      <p className={cn('text-sm text-gray-500 italic', className)}>
        No risks identified.
      </p>
    );
  }

  return (
    <ul className={cn('space-y-2', className)} aria-label="Project risks">
      {risks.map((risk) => (
        <li key={risk.id} className="flex items-start gap-2 text-sm">
          <SeverityIndicator severity={risk.severity} className="mt-1" />
          <span className="text-gray-800">{risk.description}</span>
        </li>
      ))}
    </ul>
  );
}

export { severityIndicatorVariants };
