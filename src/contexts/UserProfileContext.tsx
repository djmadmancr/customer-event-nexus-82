
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '@/types/models';

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage or set defaults
    const savedProfile = localStorage.getItem('userProfile');
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
    setLoading(false);
  }, []);

  const setDefaultProfile = () => {
    const defaultProfile: UserProfile = {
      id: 'default-user',
      name: 'Usuario',
      artistName: '',
      email: 'usuario@example.com',
      phone: '+506 0000-0000',
      logoUrl: '',
      updatedAt: new Date(),
    };
    setUserProfile(defaultProfile);
    localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
  };

  const updateUserProfile = (profileData: Partial<UserProfile>) => {
    if (!userProfile) return;

    const updatedProfile = {
      ...userProfile,
      ...profileData,
      updatedAt: new Date(),
    };

    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
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
