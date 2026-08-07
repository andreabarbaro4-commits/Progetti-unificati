import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import itTranslation from '../locales/it.json';
import enTranslation from '../locales/en.json';

export const STORAGE_KEY = 'flowlee-lang';
export const SUPPORTED_LOCALES = ['en', 'it'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function getInitialLocale(): SupportedLocale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) {
      return stored as SupportedLocale;
    }
    // Remove invalid entry if present
    if (stored !== null) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable — use default
  }
  return 'en';
}

export function persistLocale(locale: SupportedLocale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Silently fail — app continues with in-memory locale
  }
}

i18n.use(initReactI18next).init({
  resources: {
    it: { translation: itTranslation },
    en: { translation: enTranslation }
  },
  lng: getInitialLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
