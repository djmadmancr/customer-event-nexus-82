
import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { useToast } from '@/hooks/use-toast';
import { AppSettings } from '@/types/models';

interface AppConfigContextType {
  appName: string;
  logoUrl: string | null;
  isLoading: boolean;
  updateAppConfig: (name: string, logo: string | null) => Promise<void>;
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
  children: React.ReactNode;
}

export const AppConfigProvider: React.FC<AppConfigProviderProps> = ({ children }) => {
  const [appName, setAppName] = useState<string>('CRM Sistema de Gestión');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = doc(firestore, 'settings', 'appSettings');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          const data = settingsSnap.data() as Partial<AppSettings>;
          setAppName(data.appName || 'CRM Sistema de Gestión');
          setLogoUrl(data.logoUrl || null);
        }
      } catch (error) {
        console.error('Error loading app settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const updateAppConfig = async (name: string, logo: string | null) => {
    try {
      setIsLoading(true);
      const settingsRef = doc(firestore, 'settings', 'appSettings');
      
      await setDoc(settingsRef, {
        appName: name,
        logoUrl: logo,
        updatedAt: new Date()
      }, { merge: true });
      
      setAppName(name);
      setLogoUrl(logo);
      
      toast({
        title: "Configuración actualizada",
        description: "La configuración de la aplicación ha sido actualizada correctamente.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    appName,
    logoUrl,
    isLoading,
    updateAppConfig,
  };

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
};
