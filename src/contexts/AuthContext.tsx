
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
  updateDoc,
  collection,
  query,
  where,
  getDocs 
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
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, active: boolean) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
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
            // Default to user role if no document exists yet
            setUserRole('user');
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast({
            title: "Error",
            description: "No se pudo cargar los datos del usuario",
            variant: "destructive",
          });
        }
      } else {
        setUserRole(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente.",
      });
    } catch (error: any) {
      let errorMessage = "Error al iniciar sesión. Intente nuevamente.";
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Credenciales incorrectas. Verifica tu email y contraseña.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Demasiados intentos fallidos. Intenta más tarde.";
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
      
      // Check if this is the first user (will be an admin)
      const usersQuery = query(collection(firestore, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const isFirstUser = usersSnapshot.empty;
      
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        email,
        name,
        role: isFirstUser ? 'admin' : 'user', // First user is admin
        active: true,
        createdAt: new Date(),
      });
      
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente.",
      });
    } catch (error: any) {
      let errorMessage = "Error al registrar. Intente nuevamente.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "El correo electrónico ya está en uso.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La contraseña es demasiado débil.";
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

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, { role: newRole });
      
      toast({
        title: "Rol actualizado",
        description: `El rol del usuario ha sido actualizado a ${newRole}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario.",
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
        description: `El usuario ha sido ${active ? 'activado' : 'desactivado'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getAllUsers = async () => {
    try {
      const usersQuery = query(collection(firestore, 'users'));
      const querySnapshot = await getDocs(usersQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios.",
        variant: "destructive",
      });
      return [];
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
    updateUserRole,
    updateUserStatus,
    getAllUsers,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Cargando...</div>}
    </AuthContext.Provider>
  );
};
