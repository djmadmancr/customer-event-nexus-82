
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  // Mantener compatibilidad con código existente
  currentUser: User | null;
  // Propiedades adicionales para compatibilidad
  userData: any;
  userRole: string;
  subscriptionData: any;
  refreshSubscription: () => Promise<void>;
  getAllUsers: () => Promise<any[]>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  updateUserStatus: (userId: string, status: string) => Promise<void>;
  adminUpdateSubscription: (userId: string, subscription: any) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Handle auth token from URL hash (magic link)
    const handleAuthToken = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        // Clear the hash from URL to clean it up
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleAuthToken();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          toast({
            title: "Sesión iniciada",
            description: `Bienvenido ${session?.user?.email}`,
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signIn = async (email: string) => {
    try {
      // Usar la URL correcta del proyecto
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      toast({
        title: "Enlace mágico enviado",
        description: "Revisa tu correo electrónico para iniciar sesión",
      });

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Error de inicio de sesión",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      toast({
        title: "Cuenta creada",
        description: "Revisa tu correo electrónico para confirmar tu cuenta",
      });

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Error de registro",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error al cerrar sesión",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  // Funciones placeholder para compatibilidad
  const refreshSubscription = async () => {
    // Placeholder para compatibilidad
  };

  const getAllUsers = async () => {
    // Placeholder para compatibilidad
    return [];
  };

  const updateUserRole = async (userId: string, role: string) => {
    // Placeholder para compatibilidad
  };

  const updateUserStatus = async (userId: string, status: string) => {
    // Placeholder para compatibilidad
  };

  const adminUpdateSubscription = async (userId: string, subscription: any) => {
    // Placeholder para compatibilidad
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
    currentUser: user, // Compatibilidad con código existente
    userData: user ? { 
      id: user.id, 
      uid: user.id, // Agregar uid como alias de id para compatibilidad
      email: user.email 
    } : null,
    userRole: 'user',
    subscriptionData: null,
    refreshSubscription,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    adminUpdateSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
