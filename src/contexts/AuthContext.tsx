import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types/models';
import { sanitizeInput, validateEmail, validatePassword } from '@/utils/securityUtils';
import dataService from '@/services/DataService';
import { addDays, isAfter } from 'date-fns';

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

interface AuthContextType {
  currentUser: AuthUser | null;
  userRole: UserRole | null;
  userData: ExtendedUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAllUsers: () => Promise<ExtendedUser[]>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, active: boolean) => Promise<void>;
  syncUserName: () => void;
  checkSubscriptionStatus: (user: ExtendedUser) => 'active' | 'grace' | 'suspended';
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
        const demoUser = DEMO_USERS.find(u => u.email === user.email);
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
      
      // Find demo user
      const demoUser = DEMO_USERS.find(
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
      const existingUser = DEMO_USERS.find(u => u.email.toLowerCase() === sanitizedEmail);
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
      
      // Add to demo users array
      DEMO_USERS.push(newUser);
      
      // Create user profile space in data service
      dataService.createUserProfile(newUser.id);
      
      // Create user profile with the name from registration
      const defaultProfile = {
        id: newUser.id,
        name: sanitizedName, // Use the name from registration
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
    return DEMO_USERS;
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
      user.role = newRole;
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado",
      });
    }
  };

  const updateUserStatus = async (userId: string, active: boolean) => {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
      user.active = active;
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
    loading,
    signIn,
    signUp,
    signOut,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    syncUserName,
    checkSubscriptionStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
