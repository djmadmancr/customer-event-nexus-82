
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { auth, firestore } from '../config/firebase';
import { User, UserRole } from '@/types/models';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userRole: UserRole | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
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
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Create demo user on app load
  useEffect(() => {
    const createDemoUser = async () => {
      try {
        console.log('Creating demo user...');
        const userCredential = await createUserWithEmailAndPassword(auth, 'djmadmancr@gmail.com', 'Djmadman001k');
        const demoUser = userCredential.user;
        
        await setDoc(doc(firestore, 'users', demoUser.uid), {
          email: 'djmadmancr@gmail.com',
          name: 'Demo User',
          role: 'admin',
          active: true,
          createdAt: new Date()
        });
        
        console.log('✅ Demo user created successfully');
        await firebaseSignOut(auth);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log('✅ Demo user already exists');
        } else {
          console.error('❌ Error creating demo user:', error);
        }
      }
    };

    createDemoUser();
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userSnapshot = await getDoc(userDocRef);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data() as Omit<User, 'id'>;
            setUserRole(userData.role);
            setUserData({ id: user.uid, ...userData });
          } else {
            setUserRole('user');
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserRole(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log(`Attempting to sign in with: ${email}`);
      
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign in successful');
      
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente.",
      });
    } catch (error: any) {
      console.error("❌ Error during login:", error);
      
      let errorMessage = "Credenciales incorrectas. Verifica tu email y contraseña.";
      
      toast({
        title: "Error",
        description: errorMessage,
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
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(firestore, 'users', user.uid), {
        email,
        name,
        role: 'user' as UserRole,
        active: true,
        createdAt: new Date()
      });
      
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente.",
      });
      
    } catch (error: any) {
      console.error("Error during registration:", error);
      
      let errorMessage = "Error al registrar. Intente nuevamente.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "El correo electrónico ya está en uso.";
      }
      
      toast({
        title: "Error",
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
      await firebaseSignOut(auth);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión.",
        variant: "destructive",
      });
      throw error;
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crm-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
