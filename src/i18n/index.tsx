import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ja, type Translation } from './ja';
import { en } from './en';

type Locale = 'ja' | 'en';

const translations: Record<Locale, Translation> = {
  ja,
  en,
};

interface I18nContextType {
  locale: Locale;
  t: Translation;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getBrowserLocale(): Locale {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ja')) {
    return 'ja';
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('locale') as Locale | null;
    return saved || getBrowserLocale();
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const value: I18nContextType = {
    locale,
    t: translations[locale],
    setLocale,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

/**
 * 文字列内の {{key}} を値で置換
 */
export function interpolate(str: string, values: Record<string, string | number>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] || ''));
}
