
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

  useEffect(() => {
    if (currentUser) {
      // Load language from localStorage with user-specific key
      const languageKey = `defaultLanguage_${currentUser.uid}`;
      const savedLanguage = localStorage.getItem(languageKey) as Language;
      
      if (savedLanguage && ['es', 'en', 'pt'].includes(savedLanguage)) {
        setCurrentLanguage(savedLanguage);
      } else {
        setCurrentLanguage('es'); // Default to Spanish
      }
    } else {
      setCurrentLanguage('es'); // Default when no user
    }
  }, [currentUser?.uid]);

  const setLanguage = (language: Language) => {
    if (!currentUser) return;
    
    console.log('Updating language for user:', currentUser.uid, 'Language:', language);
    setCurrentLanguage(language);
    
    // Save to localStorage with user-specific key
    const languageKey = `defaultLanguage_${currentUser.uid}`;
    localStorage.setItem(languageKey, language);
  };

  // Translation function - loads from translations file
  const t = (key: string): string => {
    try {
      const translations = require(`@/locales/${currentLanguage}.json`);
      return translations[key] || key;
    } catch (error) {
      console.warn(`Translation not found for key: ${key} in language: ${currentLanguage}`);
      return key;
    }
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
