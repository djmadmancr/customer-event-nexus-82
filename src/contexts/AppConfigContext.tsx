
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface AppConfig {
  companyName: string;
  companyLogo: string;
  primaryColor: string;
  secondaryColor: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
}

interface AppConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => Promise<void>;
  loading: boolean;
  logoUrl: string;
  defaultCurrency: string;
}

const defaultConfig: AppConfig = {
  companyName: 'Bassline CRM',
  companyLogo: '',
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  currency: 'USD',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
};

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
};

interface AppConfigProviderProps {
  children: ReactNode;
}

export const AppConfigProvider: React.FC<AppConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading for now since we don't have the app_config table yet
    setLoading(false);
  }, [user?.id]);

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    if (!user?.id) return;
    
    try {
      const updatedConfig = { ...config, ...newConfig };
      setConfig(updatedConfig);
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  };

  const value = {
    config,
    updateConfig,
    loading,
    logoUrl: config.companyLogo,
    defaultCurrency: config.currency,
  };

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
};
