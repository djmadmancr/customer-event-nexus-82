import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency } from '@/types/models';
import { useAuth } from './AuthContext';

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
  const { currentUser } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>('CRC');
  const [defaultTaxPercentage, setDefaultTaxPercentage] = useState<number>(13);

  useEffect(() => {
    console.log('Loading app config for user:', currentUser?.uid);
    if (currentUser) {
      // Load from localStorage with user-specific keys
      const logoKey = `appLogoUrl_${currentUser.uid}`;
      const currencyKey = `defaultCurrency_${currentUser.uid}`;
      const taxKey = `defaultTaxPercentage_${currentUser.uid}`;
      
      const savedLogoUrl = localStorage.getItem(logoKey);
      const savedCurrency = localStorage.getItem(currencyKey) as Currency;
      const savedTaxPercentage = localStorage.getItem(taxKey);
      
      if (savedLogoUrl) {
        setLogoUrl(savedLogoUrl);
      } else {
        setLogoUrl(null);
      }
      
      if (savedCurrency) {
        setDefaultCurrency(savedCurrency);
      } else {
        setDefaultCurrency('CRC');
      }
      
      if (savedTaxPercentage) {
        setDefaultTaxPercentage(parseFloat(savedTaxPercentage));
      } else {
        setDefaultTaxPercentage(13);
      }
    } else {
      // No user logged in, reset to defaults
      setLogoUrl(null);
      setDefaultCurrency('CRC');
      setDefaultTaxPercentage(13);
    }
  }, [currentUser?.uid]);

  const updateAppLogo = async (newLogoUrl: string | null) => {
    if (!currentUser) return;
    
    console.log('Updating logo for user:', currentUser.uid, 'Logo:', newLogoUrl ? 'Set' : 'Removed');
    setLogoUrl(newLogoUrl);
    
    // Save to localStorage with user-specific key
    const logoKey = `appLogoUrl_${currentUser.uid}`;
    if (newLogoUrl) {
      localStorage.setItem(logoKey, newLogoUrl);
    } else {
      localStorage.removeItem(logoKey);
    }
  };

  // Add updateLogoUrl as an alias for compatibility
  const updateLogoUrl = updateAppLogo;

  const updateDefaultCurrency = (currency: Currency) => {
    if (!currentUser) return;
    
    console.log('Updating currency for user:', currentUser.uid, 'Currency:', currency);
    setDefaultCurrency(currency);
    const currencyKey = `defaultCurrency_${currentUser.uid}`;
    localStorage.setItem(currencyKey, currency);
  };

  const updateDefaultTaxPercentage = (taxPercentage: number) => {
    if (!currentUser) return;
    
    console.log('Updating tax percentage for user:', currentUser.uid, 'Tax:', taxPercentage);
    setDefaultTaxPercentage(taxPercentage);
    const taxKey = `defaultTaxPercentage_${currentUser.uid}`;
    localStorage.setItem(taxKey, taxPercentage.toString());
  };

  const value = {
    logoUrl,
    defaultCurrency,
    defaultTaxPercentage,
    updateAppLogo,
    updateLogoUrl, // Add alias for backward compatibility
    updateDefaultCurrency,
    updateDefaultTaxPercentage,
  };

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
};
