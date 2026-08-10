import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, persistLocale } from '../../lib/i18n';
import type { SupportedLocale } from '../../lib/i18n';
import { cn } from '../../lib/utils';

interface LocaleSwitcherProps {
  className?: string;
}

const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'EN',
  it: 'IT',
};

/**
 * Two-button toggle for switching between English and Italian.
 *
 * On selection it updates the i18n instance language and persists the choice
 * to localStorage so the preference survives page reloads.
 */
export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language as SupportedLocale;

  function handleSelect(locale: SupportedLocale) {
    if (locale === currentLocale) return;
    i18n.changeLanguage(locale);
    persistLocale(locale);
  }

  return (
    <div className={cn('inline-flex rounded-full border border-gray-200', className)}>
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          className={cn(
            'cursor-pointer rounded-full border-none px-3 py-1 text-xs font-semibold transition-colors min-h-11 min-w-11 md:min-h-0 md:min-w-0',
            locale === currentLocale
              ? 'bg-black text-white'
              : 'bg-transparent text-gray-600 hover:bg-gray-100',
          )}
          aria-pressed={locale === currentLocale}
          type="button"
          onClick={() => handleSelect(locale)}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </div>
  );
}
