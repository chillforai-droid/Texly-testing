import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Language, Translations } from '../data/translations';
// English translations synchronously import — complete object, कोई undefined नहीं।
// hi/hn को lazy-load किया जाएगा ताकि 105 KB main bundle में न जाए।
import enTranslations from '../data/translations.en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  // English immediately available — no crash on first render
  const [t, setT] = useState<Translations>(enTranslations);

  // Step 1: detect saved/browser language
  useEffect(() => {
    const savedLang = localStorage.getItem('texly_language') as Language;
    if (savedLang && ['en', 'hi', 'hn'].includes(savedLang)) {
      setLanguageState(savedLang);
    } else {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('hi')) {
        setLanguageState('hi');
      }
    }
  }, []);

  // Step 2: if English → already loaded; if hi/hn → lazy load full translations
  useEffect(() => {
    if (language === 'en') {
      setT(enTranslations);
    } else {
      // hi/hn को lazily load करो — ~105 KB bundle split हो जाएगा
      import('../data/translations').then((m) => {
        setT(m.translations[language]);
      });
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('texly_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

