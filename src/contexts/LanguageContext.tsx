
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/types/models';
import { useAuth } from './AuthContext';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe ser utilizado dentro de un LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('es');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Load translations for current language
  const loadTranslations = async (language: Language) => {
    try {
      const translationModule = await import(`@/locales/${language}.json`);
      setTranslations(translationModule.default);
    } catch (error) {
      console.warn(`Failed to load translations for language: ${language}`);
      // Fallback to Spanish
      const fallbackModule = await import('@/locales/es.json');
      setTranslations(fallbackModule.default);
    }
  };

  useEffect(() => {
    if (currentUser) {
      // Load language from localStorage with user-specific key
      const languageKey = `defaultLanguage_${currentUser.uid}`;
      const savedLanguage = localStorage.getItem(languageKey) as Language;
      
      if (savedLanguage && ['es', 'en', 'pt'].includes(savedLanguage)) {
        setCurrentLanguage(savedLanguage);
        loadTranslations(savedLanguage);
      } else {
        setCurrentLanguage('es'); // Default to Spanish
        loadTranslations('es');
      }
    } else {
      setCurrentLanguage('es'); // Default when no user
      loadTranslations('es');
    }
  }, [currentUser?.uid]);

  // Load translations when language changes
  useEffect(() => {
    loadTranslations(currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (language: Language) => {
    console.log('Updating language to:', language);
    setCurrentLanguage(language);
    loadTranslations(language);
    
    if (currentUser) {
      // Save to localStorage with user-specific key
      const languageKey = `defaultLanguage_${currentUser.uid}`;
      localStorage.setItem(languageKey, language);
    }
  };

  // Translation function
  const t = (key: string): string => {
    return translations[key] || key;
  };

  const value = {
    currentLanguage,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
