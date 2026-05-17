import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, Translations } from '../data/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Check for saved preference
    const savedLang = localStorage.getItem('texly_language') as Language;
    if (savedLang && ['en', 'hi', 'hn'].includes(savedLang)) {
      setLanguageState(savedLang);
    } else {
      // Automatic detection
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('hi')) {
        setLanguageState('hi');
      } else if (browserLang.includes('in')) {
        // If from India, maybe default to Hinglish or Hindi
        // But let's stick to browser language code for now
        // Or just default to English but allow manual switch
        setLanguageState('en');
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('texly_language', lang);
  };

  const t = translations[language];

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
