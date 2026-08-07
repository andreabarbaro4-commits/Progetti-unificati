import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, persistLocale } from '../../lib/i18n';
import type { SupportedLocale } from '../../lib/i18n';

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
    <div className={['inline-flex rounded-full border border-gray-200', className].filter(Boolean).join(' ')}>
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => handleSelect(locale)}
          aria-pressed={locale === currentLocale}
          className={[
            'cursor-pointer rounded-full border-none px-3 py-1 text-xs font-semibold transition-colors',
            locale === currentLocale
              ? 'bg-black text-white'
              : 'bg-transparent text-gray-600 hover:bg-gray-100',
          ].join(' ')}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </div>
  );
}
