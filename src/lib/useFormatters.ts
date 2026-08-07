import { useState, useEffect, useMemo } from 'react';
import i18n from './i18n';

export interface Formatters {
  formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string;
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string;
  formatCurrency(value: number, currency: string, options?: Intl.NumberFormatOptions): string;
}

/**
 * Returns the effective locale for Intl APIs.
 * Falls back to 'en' if the browser doesn't support the active locale.
 */
function resolveLocale(locale: string): string {
  try {
    const supported = Intl.DateTimeFormat.supportedLocalesOf([locale]);
    return supported.length > 0 ? locale : 'en';
  } catch {
    return 'en';
  }
}

/**
 * Hook that provides locale-aware date, number, and currency formatting.
 * Automatically re-renders when the i18n language changes.
 */
export function useFormatters(): Formatters {
  const [locale, setLocale] = useState(() => resolveLocale(i18n.language || 'en'));

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLocale(resolveLocale(lng));
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const formatters = useMemo<Formatters>(() => ({
    formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
      const dateObj = date instanceof Date ? date : new Date(date);
      const formatOptions: Intl.DateTimeFormatOptions = options ?? { dateStyle: 'short' };
      return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
    },

    formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
      return new Intl.NumberFormat(locale, options).format(value);
    },

    formatCurrency(value: number, currency: string, options?: Intl.NumberFormatOptions): string {
      const formatOptions: Intl.NumberFormatOptions = {
        ...options,
        style: 'currency',
        currency,
      };
      return new Intl.NumberFormat(locale, formatOptions).format(value);
    },
  }), [locale]);

  return formatters;
}
