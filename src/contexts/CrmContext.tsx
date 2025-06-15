
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { Customer, Event, Payment } from '../types/models';
import dataService from '../services/DataService';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface CrmContextType {
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  refreshCustomers: () => void;
  
  events: Event[];
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  refreshEvents: () => void;
  removeEvent: (eventId: string) => Promise<void>;
  
  payments: Payment[];
  refreshPayments: () => void;
}

const CrmContext = createContext<CrmContextType | null>(null);

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};

interface CrmProviderProps {
  children: ReactNode;
}

export const CrmProvider: React.FC<CrmProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const { addNotification, notifications } = useNotifications();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Stable user ID reference
  const userId = currentUser?.uid;

  // Memoized refresh functions
  const refreshCustomers = useCallback(() => {
    if (userId) {
      console.log('Refreshing customers for user:', userId);
      const customerData = dataService.getAllCustomers();
      setCustomers(customerData);
    }
  }, [userId]);
  
  const refreshEvents = useCallback(() => {
    if (userId) {
      console.log('Refreshing events for user:', userId);
      const eventData = dataService.getAllEvents();
      setEvents(eventData);
    }
  }, [userId]);
  
  const refreshPayments = useCallback(() => {
    if (userId) {
      console.log('Refreshing payments for user:', userId);
      setPayments(dataService.getAllPayments());
    }
  }, [userId]);

  const removeEvent = useCallback(async (eventId: string): Promise<void> => {
    try {
      dataService.deleteEvent(eventId);
      refreshEvents();
    } catch (error) {
      console.error('Error removing event:', error);
      throw error;
    }
  }, [refreshEvents]);

  // Initialize data when user changes
  useEffect(() => {
    if (userId) {
      console.log('User changed, initializing data for:', userId);
      refreshCustomers();
      refreshEvents();
      refreshPayments();
      setSelectedCustomer(null);
      setSelectedEvent(null);
    } else {
      // Clear data if no user
      setCustomers([]);
      setEvents([]);
      setPayments([]);
      setSelectedCustomer(null);
      setSelectedEvent(null);
    }
  }, [userId, refreshCustomers, refreshEvents, refreshPayments]);
  
  // Update payments when selected event changes
  useEffect(() => {
    if (selectedEvent && userId) {
      console.log('Selected event changed:', selectedEvent.id);
      setPayments(dataService.getPaymentsByEventId(selectedEvent.id));
    } else if (userId && !selectedEvent) {
      setPayments(dataService.getAllPayments());
    } else {
      setPayments([]);
    }
  }, [selectedEvent?.id, userId]);

  // Check for pending payment notifications (optimized)
  const notificationCheck = useMemo(() => {
    if (!userId || !events.length) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    events.forEach(event => {
      if (event.status === 'show_completed' && new Date(event.date) < sevenDaysAgo) {
        const eventPayments = dataService.getPaymentsByEventId(event.id);
        const totalPaid = eventPayments.reduce((acc, p) => acc + p.amount, 0);
        const totalCost = event.totalWithTax || event.cost;

        if (totalPaid < totalCost) {
          const existingNotification = notifications.find(
            n => n.targetId === event.id && n.type === 'payment_due'
          );

          if (!existingNotification) {
            addNotification({
              type: 'payment_due',
              title: 'Cobro pendiente',
              message: `El evento "${event.title}" tiene un saldo pendiente de ${totalCost - totalPaid}.`,
              targetId: event.id,
              targetType: 'event',
            });
          }
        }
      }
    });
  }, [events.length, userId, notifications, addNotification]);

  const value = useMemo(() => ({
    customers,
    selectedCustomer,
    setSelectedCustomer,
    refreshCustomers,
    
    events,
    selectedEvent,
    setSelectedEvent,
    refreshEvents,
    removeEvent,
    
    payments,
    refreshPayments,
  }), [
    customers,
    selectedCustomer,
    refreshCustomers,
    events,
    selectedEvent,
    refreshEvents,
    removeEvent,
    payments,
    refreshPayments,
  ]);
  
  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
};
