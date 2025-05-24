
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppConfigContextType {
  appName: string;
  logoUrl: string | null;
  updateAppConfig: (appName: string, logoUrl: string | null) => Promise<void>;
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
  const [appName, setAppName] = useState('CRM Sistema de Gestión');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage instead of Firebase to avoid connection errors
    const savedAppName = localStorage.getItem('appName');
    const savedLogoUrl = localStorage.getItem('appLogoUrl');
    
    if (savedAppName) {
      setAppName(savedAppName);
    }
    if (savedLogoUrl) {
      setLogoUrl(savedLogoUrl);
    }
  }, []);

  const updateAppConfig = async (newAppName: string, newLogoUrl: string | null) => {
    setAppName(newAppName);
    setLogoUrl(newLogoUrl);
    
    // Save to localStorage
    localStorage.setItem('appName', newAppName);
    if (newLogoUrl) {
      localStorage.setItem('appLogoUrl', newLogoUrl);
    } else {
      localStorage.removeItem('appLogoUrl');
    }
  };

  const value = {
    appName,
    logoUrl,
    updateAppConfig,
  };

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
};
