
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  imapUser: string;
  imapPassword: string;
  fromName: string;
  fromEmail: string;
}

interface EmailConfigContextType {
  emailConfig: EmailConfig;
  updateEmailConfig: (config: Partial<EmailConfig>) => void;
  isConfigured: boolean;
  testEmailConnection: () => Promise<boolean>;
}

const defaultEmailConfig: EmailConfig = {
  smtpHost: '',
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: '',
  smtpPassword: '',
  imapHost: '',
  imapPort: 993,
  imapSecure: true,
  imapUser: '',
  imapPassword: '',
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
      // Load from localStorage with user-specific key
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
      // No user logged in, reset to defaults
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
    
    // Save with user-specific key
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
    // In a real implementation, this would test the SMTP connection
    // For this demo, we'll just validate that the config is complete
    try {
      if (!isConfigured) {
        throw new Error('Configuración de email incompleta');
      }
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  };

  const value = {
    emailConfig,
    updateEmailConfig,
    isConfigured,
    testEmailConnection,
  };

  return (
    <EmailConfigContext.Provider value={value}>
      {children}
    </EmailConfigContext.Provider>
  );
};
