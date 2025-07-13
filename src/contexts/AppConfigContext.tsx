
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
    if (user?.id) {
      loadConfig();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading config:', error);
        return;
      }

      if (data) {
        setConfig({
          companyName: data.company_name || defaultConfig.companyName,
          companyLogo: data.company_logo || defaultConfig.companyLogo,
          primaryColor: data.primary_color || defaultConfig.primaryColor,
          secondaryColor: data.secondary_color || defaultConfig.secondaryColor,
          currency: data.currency || defaultConfig.currency,
          dateFormat: data.date_format || defaultConfig.dateFormat,
          timeFormat: data.time_format || defaultConfig.timeFormat,
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    if (!user?.id) return;

    try {
      const updatedConfig = { ...config, ...newConfig };
      
      const { error } = await supabase
        .from('app_config')
        .upsert({
          user_id: user.id,
          company_name: updatedConfig.companyName,
          company_logo: updatedConfig.companyLogo,
          primary_color: updatedConfig.primaryColor,
          secondary_color: updatedConfig.secondaryColor,
          currency: updatedConfig.currency,
          date_format: updatedConfig.dateFormat,
          time_format: updatedConfig.timeFormat,
        });

      if (error) throw error;

      setConfig(updatedConfig);
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  };

  return (
    <AppConfigContext.Provider value={{ config, updateConfig, loading }}>
      {children}
    </AppConfigContext.Provider>
  );
};
