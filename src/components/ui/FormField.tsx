import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface FormFieldProps {
  name: string;
  label: string;       // i18n key
  error?: string;      // i18n key for error message
  children: ReactNode; // input element
  /** When true, skips the default input styling (bg, border, radius) so the children control their own appearance */
  unstyled?: boolean;
}

/**
 * Consistent form field wrapper that renders a translated label,
 * the input element (children), and a fixed-height error slot (no layout shift).
 *
 * Accessibility:
 * - Label linked to input via `htmlFor={name}`
 * - Error message has `id="${name}-error"` for `aria-describedby` on inputs
 */
export function FormField({ name, label, error, children, unstyled = false }: FormFieldProps) {
  const { t } = useTranslation();

  const styledClasses = unstyled
    ? 'relative flex flex-col mb-1 bg-transparent'
    : cn(
        'relative flex flex-col mb-1 bg-transparent',
        '[&_input]:w-full [&_input]:px-4 [&_input]:py-3 [&_input]:rounded-lg [&_input]:border-none [&_input]:bg-[#f1f1f9] [&_input]:text-base [&_input]:outline-none',
        '[&_select]:w-full [&_select]:px-4 [&_select]:py-3 [&_select]:rounded-lg [&_select]:border-none [&_select]:bg-[#f1f1f9] [&_select]:text-base [&_select]:outline-none [&_select]:appearance-none',
        '[&_textarea]:w-full [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:rounded-lg [&_textarea]:border-none [&_textarea]:bg-[#f1f1f9] [&_textarea]:text-base [&_textarea]:outline-none',
      );

  return (
    <div
      className={styledClasses}
      aria-invalid={!!error}
    >
      <label
        className="text-left bg-transparent text-black mb-1 leading-none font-bold"
        htmlFor={name}
        style={{ fontSize: '20px', color: '#000' }}
      >
        {t(label)}
      </label>

      {children}

      {/* Fixed-height error slot — prevents layout shift */}
      <div className="h-4 mt-0.5">
        {error && (
          <span
            className="text-[11px] text-red-600 leading-none"
            id={`${name}-error`}
            role="alert"
          >
            {t(error)}
          </span>
        )}
      </div>
    </div>
  );
}
