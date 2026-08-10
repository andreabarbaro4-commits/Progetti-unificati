import { cn } from '../../lib/utils';

export interface SegmentedToggleOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedToggleProps<T extends string> {
  options: [SegmentedToggleOption<T>, SegmentedToggleOption<T>];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Two-option segmented pill toggle (Requirement 8.1, 8.4).
 *
 * Visually mirrors `LocaleSwitcher`'s rounded-full, two-button pill pattern
 * (Req 1.3) so it reads as part of the same Design_System. The active
 * option (matching `value`) is indicated via `aria-pressed` and a filled
 * background, satisfying Req 8.4's "indicate which view is active"
 * requirement.
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedToggleProps<T>) {
  return (
    <div className={cn('inline-flex rounded-full border border-gray-200', className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            className={cn(
              'cursor-pointer rounded-full border-none px-3 py-1 text-xs font-semibold transition-colors min-h-11 min-w-11 md:min-h-0 md:min-w-0',
              isActive ? 'bg-black text-white' : 'bg-transparent text-gray-600 hover:bg-gray-100',
            )}
            aria-pressed={isActive}
            type="button"
            onClick={() => {
              if (option.value === value) return;
              onChange(option.value);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
