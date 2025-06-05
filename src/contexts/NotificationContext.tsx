
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useCrm } from './CrmContext';

interface Notification {
  id: string;
  type: 'new_event' | 'new_customer' | 'email_received' | 'prospect_followup';
  message: string;
  time: string;
  read: boolean;
  eventId?: string;
  customerId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
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
  const { events, customers } = useCrm();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage
  useEffect(() => {
    if (currentUser) {
      const notificationsKey = `notifications_${currentUser.uid}`;
      const savedNotifications = localStorage.getItem(notificationsKey);
      
      if (savedNotifications) {
        try {
          setNotifications(JSON.parse(savedNotifications));
        } catch (error) {
          console.error('Error loading notifications:', error);
          setNotifications([]);
        }
      }
    } else {
      setNotifications([]);
    }
  }, [currentUser?.uid]);

  // Save notifications to localStorage
  useEffect(() => {
    if (currentUser && notifications.length > 0) {
      const notificationsKey = `notifications_${currentUser.uid}`;
      localStorage.setItem(notificationsKey, JSON.stringify(notifications));
    }
  }, [notifications, currentUser?.uid]);

  // Check for prospect follow-ups every day (simplified for demo)
  useEffect(() => {
    if (events.length > 0) {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

      events.forEach(event => {
        if (event.status === 'prospect' && event.createdAt <= threeDaysAgo) {
          const existingNotification = notifications.find(
            n => n.type === 'prospect_followup' && n.eventId === event.id
          );

          if (!existingNotification) {
            addNotification({
              type: 'prospect_followup',
              message: `Seguimiento: Evento "${event.title}" lleva 3 días en prospecto`,
              eventId: event.id,
            });
          }
        }
      });
    }
  }, [events]);

  const addNotification = (notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      time: new Date().toLocaleString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
