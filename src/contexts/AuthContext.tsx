
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types/models';

// Demo users - stored in memory for guaranteed functionality
const DEMO_USERS = [
  {
    id: 'demo-admin',
    email: 'djmadmancr@gmail.com',
    password: 'Djmadman001k',
    name: 'Demo Admin',
    role: 'admin' as UserRole,
    active: true,
    createdAt: new Date()
  }
];

interface AuthUser {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  userRole: UserRole | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, active: boolean) => Promise<void>;
  syncUserName: () => void;
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
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Function to sync user name from personal data configuration
  const syncUserName = () => {
    if (currentUser) {
      const savedProfile = localStorage.getItem('userProfile');
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
          setCurrentUser({ uid: user.uid, email: user.email });
          setUserRole(demoUser.role);
          setUserData(demoUser);
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
      console.log(`🔑 Attempting sign in with: ${email}`);
      
      // Find demo user
      const demoUser = DEMO_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (!demoUser) {
        console.log('❌ Invalid credentials for:', email);
        throw new Error('Credenciales inválidas');
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
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido ${demoUser.name}`,
      });
      
    } catch (error) {
      console.error("❌ Login error:", error);
      toast({
        title: "Error de inicio de sesión",
        description: "Email o contraseña incorrectos",
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
      
      // Check if user already exists
      if (DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('El usuario ya existe');
      }
      
      // Create new demo user
      const newUser = {
        id: `demo-${Date.now()}`,
        email,
        password,
        name,
        role: 'user' as UserRole,
        active: true,
        createdAt: new Date()
      };
      
      DEMO_USERS.push(newUser);
      
      console.log('✅ User created:', email);
      
      toast({
        title: "Registro exitoso",
        description: "Usuario creado correctamente. Ahora puedes iniciar sesión.",
      });
      
    } catch (error) {
      console.error("❌ Registration error:", error);
      toast({
        title: "Error de registro",
        description: error instanceof Error ? error.message : "Error al crear usuario",
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

  const getAllUsers = async (): Promise<User[]> => {
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
