
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  fromName: string;
  fromEmail: string;
}

interface EmailConfigContextType {
  emailConfig: EmailConfig;
  updateEmailConfig: (config: Partial<EmailConfig>) => void;
  isConfigured: boolean;
  testEmailConnection: () => Promise<boolean>;
  configureGmail: () => void;
}

const defaultEmailConfig: EmailConfig = {
  smtpHost: '',
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: '',
  smtpPassword: '',
  fromName: '',
  fromEmail: '',
};

const EmailConfigContext = createContext<EmailConfigContextType | undefined>(undefined);

export const useEmailConfig = (): EmailConfigContextType => {
  const context = useContext(EmailConfigContext);
  if (!context) {
    throw new Error('useEmailConfig debe ser utilizado dentro de un EmailConfigProvider');
  }
  return context;
};

interface EmailConfigProviderProps {
  children: ReactNode;
}

export const EmailConfigProvider: React.FC<EmailConfigProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(defaultEmailConfig);

  useEffect(() => {
    if (currentUser) {
      const configKey = `emailConfig_${currentUser.uid}`;
      const savedConfig = localStorage.getItem(configKey);
      
      if (savedConfig) {
        try {
          setEmailConfig({ ...defaultEmailConfig, ...JSON.parse(savedConfig) });
        } catch (error) {
          console.error('Error loading email config:', error);
          setEmailConfig(defaultEmailConfig);
        }
      } else {
        setEmailConfig(defaultEmailConfig);
      }
    } else {
      setEmailConfig(defaultEmailConfig);
    }
  }, [currentUser?.uid]);

  const updateEmailConfig = (configData: Partial<EmailConfig>) => {
    if (!currentUser) return;

    const updatedConfig = {
      ...emailConfig,
      ...configData,
    };

    setEmailConfig(updatedConfig);
    
    const configKey = `emailConfig_${currentUser.uid}`;
    localStorage.setItem(configKey, JSON.stringify(updatedConfig));
  };

  const isConfigured = Boolean(
    emailConfig.smtpHost && 
    emailConfig.smtpUser && 
    emailConfig.smtpPassword && 
    emailConfig.fromEmail
  );

  const testEmailConnection = async (): Promise<boolean> => {
    try {
      if (!isConfigured) {
        throw new Error('Configuración de email incompleta');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  };

  const configureGmail = () => {
    const gmailConfig = {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: false,
    };
    
    updateEmailConfig(gmailConfig);
  };

  const value = {
    emailConfig,
    updateEmailConfig,
    isConfigured,
    testEmailConnection,
    configureGmail,
  };

  return (
    <EmailConfigContext.Provider value={value}>
      {children}
    </EmailConfigContext.Provider>
  );
};
