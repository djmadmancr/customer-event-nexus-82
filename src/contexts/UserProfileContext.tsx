
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '@/types/models';
import { useAuth } from './AuthContext';

interface UserProfileContextType {
  userProfile: UserProfile | null;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  loading: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile debe ser utilizado dentro de un UserProfileProvider');
  }
  return context;
};

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Loading user profile for user:', currentUser?.uid);
    if (currentUser) {
      // Load from localStorage with user-specific key
      const profileKey = `userProfile_${currentUser.uid}`;
      const savedProfile = localStorage.getItem(profileKey);
      
      if (savedProfile) {
        try {
          setUserProfile(JSON.parse(savedProfile));
        } catch (error) {
          console.error('Error loading user profile:', error);
          setDefaultProfile();
        }
      } else {
        setDefaultProfile();
      }
    } else {
      // No user logged in, clear profile
      setUserProfile(null);
    }
    setLoading(false);
  }, [currentUser?.uid]);

  const setDefaultProfile = () => {
    if (!currentUser) return;
    
    const defaultProfile: UserProfile = {
      id: currentUser.uid,
      name: 'Usuario',
      artistName: '',
      email: currentUser.email || 'usuario@example.com',
      phone: '+506 0000-0000',
      logoUrl: '',
      updatedAt: new Date(),
    };
    
    setUserProfile(defaultProfile);
    
    // Save with user-specific key
    const profileKey = `userProfile_${currentUser.uid}`;
    localStorage.setItem(profileKey, JSON.stringify(defaultProfile));
  };

  const updateUserProfile = (profileData: Partial<UserProfile>) => {
    if (!userProfile || !currentUser) return;

    const updatedProfile = {
      ...userProfile,
      ...profileData,
      updatedAt: new Date(),
    };

    setUserProfile(updatedProfile);
    
    // Save with user-specific key
    const profileKey = `userProfile_${currentUser.uid}`;
    localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
  };

  const value = {
    userProfile,
    updateUserProfile,
    loading,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};
