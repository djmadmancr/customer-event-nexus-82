
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency } from '@/types/models';

interface AppConfigContextType {
  logoUrl: string | null;
  defaultCurrency: Currency;
  defaultTaxPercentage: number;
  updateAppLogo: (logoUrl: string | null) => Promise<void>;
  updateDefaultCurrency: (currency: Currency) => void;
  updateDefaultTaxPercentage: (taxPercentage: number) => void;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export const useAppConfig = (): AppConfigContextType => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig debe ser utilizado dentro de un AppConfigProvider');
  }
  return context;
};

interface AppConfigProviderProps {
  children: ReactNode;
}

export const AppConfigProvider: React.FC<AppConfigProviderProps> = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>('CRC');
  const [defaultTaxPercentage, setDefaultTaxPercentage] = useState<number>(13);

  useEffect(() => {
    // Load from localStorage
    const savedLogoUrl = localStorage.getItem('appLogoUrl');
    const savedCurrency = localStorage.getItem('defaultCurrency') as Currency;
    const savedTaxPercentage = localStorage.getItem('defaultTaxPercentage');
    
    if (savedLogoUrl) {
      setLogoUrl(savedLogoUrl);
    }
    
    if (savedCurrency) {
      setDefaultCurrency(savedCurrency);
    }
    
    if (savedTaxPercentage) {
      setDefaultTaxPercentage(parseFloat(savedTaxPercentage));
    }
  }, []);

  const updateAppLogo = async (newLogoUrl: string | null) => {
    setLogoUrl(newLogoUrl);
    
    // Save to localStorage
    if (newLogoUrl) {
      localStorage.setItem('appLogoUrl', newLogoUrl);
    } else {
      localStorage.removeItem('appLogoUrl');
    }
  };

  const updateDefaultCurrency = (currency: Currency) => {
    setDefaultCurrency(currency);
    localStorage.setItem('defaultCurrency', currency);
  };

  const updateDefaultTaxPercentage = (taxPercentage: number) => {
    setDefaultTaxPercentage(taxPercentage);
    localStorage.setItem('defaultTaxPercentage', taxPercentage.toString());
  };

  const value = {
    logoUrl,
    defaultCurrency,
    defaultTaxPercentage,
    updateAppLogo,
    updateDefaultCurrency,
    updateDefaultTaxPercentage,
  };

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
};
