import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types/models';
import { sanitizeInput, validateEmail, validatePassword } from '@/utils/securityUtils';
import dataService from '@/services/DataService';
import { addDays, isAfter } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

// Demo users - stored in memory for guaranteed functionality
const DEMO_USERS = [
  {
    id: 'demo-admin',
    email: 'djmadmancr@gmail.com',
    password: 'Djmadman001k',
    name: 'Demo Admin',
    role: 'admin' as UserRole,
    active: true,
    createdAt: new Date(),
    subscriptionExpiry: addDays(new Date(), 30) // 30 days from now
  }
];

interface AuthUser {
  uid: string;
  email: string | null;
}

interface ExtendedUser extends User {
  subscriptionExpiry?: Date;
}

interface SubscriptionData {
  status: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  userRole: UserRole | null;
  userData: ExtendedUser | null;
  subscriptionData: SubscriptionData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAllUsers: () => Promise<ExtendedUser[]>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, active: boolean) => Promise<void>;
  syncUserName: () => void;
  checkSubscriptionStatus: (user: ExtendedUser) => 'active' | 'grace' | 'suspended';
  refreshSubscription: () => Promise<void>;
  adminUpdateSubscription: (email: string, status: string, endDate?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userData, setUserData] = useState<ExtendedUser | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkSubscriptionStatus = (user: ExtendedUser): 'active' | 'grace' | 'suspended' => {
    if (!user.subscriptionExpiry) return 'suspended';
    
    const now = new Date();
    const expiry = user.subscriptionExpiry;
    const graceEnd = addDays(expiry, 14); // 2 weeks grace period

    if (isAfter(now, graceEnd)) {
      return 'suspended';
    } else if (isAfter(now, expiry)) {
      return 'grace';
    } else {
      return 'active';
    }
  };

  const refreshSubscription = async () => {
    if (!currentUser) return;

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session) {
        console.log('No valid session for subscription check');
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      console.log('Subscription data refreshed:', data);
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error in refreshSubscription:', error);
    }
  };

  const adminUpdateSubscription = async (email: string, status: string, endDate?: string) => {
    if (userRole !== 'admin') {
      throw new Error('Solo administradores pueden actualizar suscripciones');
    }

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session) {
        throw new Error('Sesión no válida');
      }

      const updateData: any = {
        email,
        subscription_status: status,
        subscribed: status === 'active',
        updated_at: new Date().toISOString(),
      };

      if (endDate) {
        updateData.subscription_end = endDate;
      }

      const { error } = await supabase
        .from('subscribers')
        .upsert(updateData, { onConflict: 'email' });

      if (error) {
        throw new Error(`Error actualizando suscripción: ${error.message}`);
      }

      toast({
        title: "Suscripción actualizada",
        description: `Estado de suscripción actualizado para ${email}`,
      });

    } catch (error) {
      console.error('Error in adminUpdateSubscription:', error);
      throw error;
    }
  };

  // Function to get all users including those created by admin
  const getAllDemoUsers = () => {
    const storedUsers = localStorage.getItem('demo-users');
    let additionalUsers = [];
    
    if (storedUsers) {
      try {
        additionalUsers = JSON.parse(storedUsers);
        // Ensure dates are properly parsed
        additionalUsers = additionalUsers.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
          subscriptionExpiry: user.subscriptionExpiry ? new Date(user.subscriptionExpiry) : undefined
        }));
      } catch (e) {
        console.error('Error parsing stored users:', e);
        additionalUsers = [];
      }
    }
    
    return [...DEMO_USERS, ...additionalUsers];
  };

  // Function to save additional users to localStorage
  const saveAdditionalUsers = (users: ExtendedUser[]) => {
    // Filter out the default admin user and save only additional users
    const additionalUsers = users.filter(user => user.id !== 'demo-admin');
    localStorage.setItem('demo-users', JSON.stringify(additionalUsers));
  };

  // Function to sync user name from personal data configuration
  const syncUserName = () => {
    if (currentUser) {
      const profileKey = `userProfile_${currentUser.uid}`;
      const savedProfile = localStorage.getItem(profileKey);
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          if (profile.name && userData) {
            const updatedUserData = { ...userData, name: profile.name };
            setUserData(updatedUserData);
          }
        } catch (error) {
          console.log('Error syncing user name:', error);
        }
      }
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('demo-auth-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const allUsers = getAllDemoUsers();
        const demoUser = allUsers.find(u => u.email === user.email);
        
        if (demoUser) {
          const subscriptionStatus = checkSubscriptionStatus(demoUser);
          
          if (subscriptionStatus === 'suspended' && demoUser.role !== 'admin') {
            toast({
              title: "Cuenta suspendida",
              description: "Tu suscripción ha expirado. Contacta a servicio al cliente.",
              variant: "destructive",
            });
            localStorage.removeItem('demo-auth-user');
            return;
          }

          setCurrentUser({ uid: user.uid, email: user.email });
          setUserRole(demoUser.role);
          setUserData(demoUser);
          
          // Auto-refresh subscription data for authenticated users
          if (demoUser.role !== 'admin') {
            refreshSubscription();
          }
          
          if (subscriptionStatus === 'grace' && demoUser.role !== 'admin') {
            toast({
              title: "Período de gracia",
              description: "Tu suscripción ha expirado. Tienes acceso limitado por 2 semanas más.",
              variant: "destructive",
            });
          }
          
          console.log('✅ User session restored:', user.email);
        }
      } catch (error) {
        console.log('No valid session found');
        localStorage.removeItem('demo-auth-user');
      }
    }
    setLoading(false);
  }, []);

  // Sync user name when component mounts or when localStorage changes
  useEffect(() => {
    syncUserName();
    
    const handleStorageChange = () => {
      syncUserName();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser, userData]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Input validation
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      
      if (!validateEmail(email)) {
        throw new Error('Formato de email inválido');
      }
      
      console.log(`🔑 Attempting sign in with: ${email}`);
      
      // Find demo user in all available users
      const allUsers = getAllDemoUsers();
      const demoUser = allUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (!demoUser) {
        console.log('❌ Invalid credentials for:', email);
        throw new Error('Credenciales inválidas');
      }
      
      if (!demoUser.active) {
        throw new Error('Usuario desactivado. Contacte al administrador');
      }

      // Check subscription status for non-admin users
      if (demoUser.role !== 'admin') {
        const subscriptionStatus = checkSubscriptionStatus(demoUser);
        
        if (subscriptionStatus === 'suspended') {
          throw new Error('Cuenta suspendida. Tu suscripción ha expirado. Contacta a servicio al cliente.');
        }
      }
      
      // Create auth user object
      const authUser = {
        uid: demoUser.id,
        email: demoUser.email
      };
      
      // Save session
      localStorage.setItem('demo-auth-user', JSON.stringify(authUser));
      
      // Set state
      setCurrentUser(authUser);
      setUserRole(demoUser.role);
      setUserData(demoUser);
      
      // Refresh subscription data for non-admin users
      if (demoUser.role !== 'admin') {
        await refreshSubscription();
      }
      
      console.log('✅ Login successful for:', email);
      
      // Show grace period warning if applicable
      if (demoUser.role !== 'admin') {
        const subscriptionStatus = checkSubscriptionStatus(demoUser);
        if (subscriptionStatus === 'grace') {
          toast({
            title: "Período de gracia",
            description: "Tu suscripción ha expirado. Tienes acceso limitado por 2 semanas más.",
            variant: "destructive",
          });
        }
      }
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido ${demoUser.name}`,
      });
      
    } catch (error) {
      console.error("❌ Login error:", error);
      toast({
        title: "Error de inicio de sesión",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      console.log(`📝 Creating user: ${email}`);
      
      // Input validation and sanitization
      const sanitizedEmail = sanitizeInput(email.toLowerCase());
      const sanitizedName = sanitizeInput(name);
      
      if (!sanitizedEmail || !password || !sanitizedName) {
        throw new Error('Todos los campos son requeridos');
      }
      
      if (!validateEmail(sanitizedEmail)) {
        throw new Error('Formato de email inválido');
      }
      
      if (sanitizedName.length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }
      
      if (sanitizedName.length > 50) {
        throw new Error('El nombre no puede exceder 50 caracteres');
      }
      
      // Password validation
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }
      
      // Check if user already exists
      const allUsers = getAllDemoUsers();
      const existingUser = allUsers.find(u => u.email.toLowerCase() === sanitizedEmail);
      if (existingUser) {
        throw new Error('Ya existe una cuenta con este email');
      }
      
      // Create new demo user
      const newUser = {
        id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: sanitizedEmail,
        password: password, // In a real app, this would be hashed
        name: sanitizedName,
        role: 'user' as UserRole,
        active: true,
        createdAt: new Date(),
        subscriptionExpiry: addDays(new Date(), -10) // Expired by default
      };
      
      // Add to additional users in localStorage
      const currentAdditionalUsers = getAllDemoUsers().filter(u => u.id !== 'demo-admin');
      currentAdditionalUsers.push(newUser);
      localStorage.setItem('demo-users', JSON.stringify(currentAdditionalUsers));
      
      // Create user profile space in data service
      dataService.createUserProfile(newUser.id);
      
      // Create user profile with the name from registration
      const defaultProfile = {
        id: newUser.id,
        name: sanitizedName,
        artistName: '',
        email: sanitizedEmail,
        phone: '+506 0000-0000',
        logoUrl: '',
        updatedAt: new Date(),
      };
      
      // Save profile with user-specific key
      const profileKey = `userProfile_${newUser.id}`;
      localStorage.setItem(profileKey, JSON.stringify(defaultProfile));
      
      console.log('✅ User created successfully:', sanitizedEmail);
      
      toast({
        title: "Registro exitoso",
        description: `Cuenta creada para ${sanitizedName}. Serás redirigido al inicio de sesión.`,
      });
      
      // Return success - don't auto-login for security
      return;
      
    } catch (error) {
      console.error("❌ Registration error:", error);
      
      let errorMessage = "Error al crear la cuenta";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error de registro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('demo-auth-user');
      setCurrentUser(null);
      setUserRole(null);
      setUserData(null);
      setSubscriptionData(null);
      
      console.log('✅ User signed out');
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  const getAllUsers = async (): Promise<ExtendedUser[]> => {
    return getAllDemoUsers();
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const allUsers = getAllDemoUsers();
    const userIndex = allUsers.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      allUsers[userIndex].role = newRole;
      
      // Update in appropriate storage
      if (userId === 'demo-admin') {
        // This is the default admin user, update in DEMO_USERS
        DEMO_USERS[0].role = newRole;
      } else {
        // This is a user created by admin, update in localStorage
        saveAdditionalUsers(allUsers);
      }
      
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado",
      });
    }
  };

  const updateUserStatus = async (userId: string, active: boolean) => {
    const allUsers = getAllDemoUsers();
    const userIndex = allUsers.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      allUsers[userIndex].active = active;
      
      // Update in appropriate storage
      if (userId === 'demo-admin') {
        // This is the default admin user, update in DEMO_USERS
        DEMO_USERS[0].active = active;
      } else {
        // This is a user created by admin, update in localStorage
        saveAdditionalUsers(allUsers);
      }
      
      toast({
        title: "Estado actualizado",
        description: `Usuario ${active ? 'activado' : 'desactivado'}`,
      });
    }
  };

  const value = {
    currentUser,
    userRole,
    userData,
    subscriptionData,
    loading,
    signIn,
    signUp,
    signOut,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    syncUserName,
    checkSubscriptionStatus,
    refreshSubscription,
    adminUpdateSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
