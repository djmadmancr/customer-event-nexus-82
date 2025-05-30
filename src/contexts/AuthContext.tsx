
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
  setDoc,
  collection,
  getDocs,
  updateDoc
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
  getAllUsers: () => Promise<User[]>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, active: boolean) => Promise<void>;
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

  // Create demo user on app initialization
  useEffect(() => {
    const createDemoUser = async () => {
      try {
        console.log('🔧 Creating demo user with credentials: djmadmancr@gmail.com');
        
        // First try to sign out any existing user
        try {
          await firebaseSignOut(auth);
        } catch (e) {
          // Ignore sign out errors
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          'djmadmancr@gmail.com', 
          'Djmadman001k'
        );
        
        const demoUser = userCredential.user;
        
        // Create user document in Firestore
        await setDoc(doc(firestore, 'users', demoUser.uid), {
          email: 'djmadmancr@gmail.com',
          name: 'Demo User',
          role: 'admin',
          active: true,
          createdAt: new Date()
        });
        
        console.log('✅ Demo user created successfully with ID:', demoUser.uid);
        
        // Sign out the demo user after creation
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
      console.log('🔄 Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userSnapshot = await getDoc(userDocRef);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data() as Omit<User, 'id'>;
            setUserRole(userData.role);
            setUserData({ id: user.uid, ...userData });
            console.log('✅ User data loaded:', userData.role);
          } else {
            console.log('⚠️ User document not found, setting default role');
            setUserRole('user');
            setUserData(null);
          }
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          setUserRole('user');
          setUserData(null);
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
      console.log(`🔑 Attempting to sign in with: ${email}`);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign in successful for:', userCredential.user.email);
      
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente.",
      });
    } catch (error: any) {
      console.error("❌ Error during login:", error);
      
      let errorMessage = "Error al iniciar sesión. Verifica tus credenciales.";
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Email o contraseña incorrectos.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El formato del email no es válido.";
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

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      console.log(`📝 Creating new user: ${email}`);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(firestore, 'users', user.uid), {
        email,
        name,
        role: 'user' as UserRole,
        active: true,
        createdAt: new Date()
      });
      
      console.log('✅ User created successfully:', email);
      
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente.",
      });
      
    } catch (error: any) {
      console.error("❌ Error during registration:", error);
      
      let errorMessage = "Error al registrar. Intente nuevamente.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "El correo electrónico ya está en uso.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La contraseña es muy débil.";
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
      console.log('✅ User signed out successfully');
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error) {
      console.error('❌ Error signing out:', error);
      toast({
        title: "Error",
        description: "Error al cerrar sesión.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      const usersCollection = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      const users: User[] = [];
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data.email,
          name: data.name,
          role: data.role,
          active: data.active,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, { role: newRole });
      
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado correctamente.",
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el rol del usuario.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateUserStatus = async (userId: string, active: boolean) => {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, { active });
      
      toast({
        title: "Estado actualizado",
        description: `Usuario ${active ? 'activado' : 'desactivado'} correctamente.`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el estado del usuario.",
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
    getAllUsers,
    updateUserRole,
    updateUserStatus,
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
