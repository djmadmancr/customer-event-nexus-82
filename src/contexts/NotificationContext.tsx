
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '@/types/models';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser utilizado dentro de un NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage when user changes
  useEffect(() => {
    if (currentUser) {
      const notificationsKey = `notifications_${currentUser.uid}`;
      const savedNotifications = localStorage.getItem(notificationsKey);
      
      if (savedNotifications) {
        try {
          const parsedNotifications = JSON.parse(savedNotifications);
          setNotifications(parsedNotifications.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt)
          })));
        } catch (error) {
          console.error('Error loading notifications:', error);
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }
  }, [currentUser?.uid]);

  // Save notifications to localStorage whenever notifications change
  useEffect(() => {
    if (currentUser) {
      const notificationsKey = `notifications_${currentUser.uid}`;
      localStorage.setItem(notificationsKey, JSON.stringify(notifications));
    }
  }, [notifications, currentUser?.uid]);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isRead: false,
      createdAt: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    // Remove all read notifications instead of just marking them as read
    setNotifications(prev => prev.filter(notification => notification.isRead === false));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
