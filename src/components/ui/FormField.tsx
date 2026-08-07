import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface FormFieldProps {
  name: string;
  label: string;       // i18n key
  error?: string;      // i18n key for error message
  children: ReactNode; // input element
}

/**
 * Consistent form field wrapper that renders a translated label,
 * the input element (children), and an optional translated error message.
 *
 * Accessibility:
 * - Label linked to input via `htmlFor={name}`
 * - Error message has `id="${name}-error"` for `aria-describedby` on inputs
 * - Wrapper carries `data-invalid` attribute for styling hooks
 */
export function FormField({ name, label, error, children }: FormFieldProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col gap-1"
      data-invalid={!!error || undefined}
      aria-invalid={!!error}
    >
      <label
        htmlFor={name}
        className="text-sm font-medium text-gray-700"
      >
        {t(label)}
      </label>

      {children}

      {error && (
        <span
          id={`${name}-error`}
          role="alert"
          className="text-xs text-red-600"
        >
          {t(error)}
        </span>
      )}
    </div>
  );
}
