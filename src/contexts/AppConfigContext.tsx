
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppConfigContextType {
  logoUrl: string | null;
  updateAppLogo: (logoUrl: string | null) => Promise<void>;
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

  useEffect(() => {
    // Load from localStorage
    const savedLogoUrl = localStorage.getItem('appLogoUrl');
    
    if (savedLogoUrl) {
      setLogoUrl(savedLogoUrl);
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

  const value = {
    logoUrl,
    updateAppLogo,
  };

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
};
