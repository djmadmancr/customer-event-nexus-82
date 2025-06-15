
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Customer, Event, Payment } from '../types/models';
import dataService from '../services/DataService';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface CrmContextType {
  // Customers
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  refreshCustomers: () => void;
  
  // Events
  events: Event[];
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  refreshEvents: () => void;
  removeEvent: (eventId: string) => Promise<void>;
  
  // Payments
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
  
  // Memoized refresh functions to prevent infinite loops
  const refreshCustomers = useCallback(() => {
    if (currentUser) {
      console.log('Refreshing customers for user:', currentUser.uid);
      const customerData = dataService.getAllCustomers();
      setCustomers(customerData);
    }
  }, [currentUser]);
  
  const refreshEvents = useCallback(() => {
    if (currentUser) {
      console.log('Refreshing events for user:', currentUser.uid);
      const eventData = dataService.getAllEvents();
      setEvents(eventData);
    }
  }, [currentUser]);
  
  const removeEvent = async (eventId: string): Promise<void> => {
    try {
      dataService.deleteEvent(eventId);
      refreshEvents();
    } catch (error) {
      console.error('Error removing event:', error);
      throw error;
    }
  };
  
  const refreshPayments = useCallback(() => {
    if (currentUser) {
      console.log('Refreshing payments for user:', currentUser.uid);
      setPayments(dataService.getAllPayments());
    }
  }, [currentUser]);

  // Initial data load when user changes - FIXED to prevent infinite loops
  useEffect(() => {
    console.log('User changed, initializing data for:', currentUser?.uid);
    if (currentUser) {
      refreshCustomers();
      refreshEvents();
      refreshPayments();
      setSelectedCustomer(null);
      setSelectedEvent(null);
    } else {
      // Clear data if no user is logged in
      setCustomers([]);
      setEvents([]);
      setPayments([]);
      setSelectedCustomer(null);
      setSelectedEvent(null);
    }
  }, [currentUser?.uid]); // Only depend on currentUser.uid to prevent loops
  
  // Update payments when selected event changes (only used for filtering view, not dashboard)
  useEffect(() => {
    console.log('Selected event changed:', selectedEvent?.id);
    if (selectedEvent && currentUser) {
      setPayments(dataService.getPaymentsByEventId(selectedEvent.id));
    } else if (currentUser && !selectedEvent) {
      // If no event is selected, show all payments.
      const allPayments = dataService.getAllPayments();
      setPayments(allPayments);
    } else {
      setPayments([]);
    }
  }, [selectedEvent?.id, currentUser?.uid]); // Fixed dependencies

  // Check for pending payment notifications - OPTIMIZED
  useEffect(() => {
    if (!currentUser || !events.length) return;

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
  }, [events.length, currentUser?.uid]); // Optimized dependencies
  
  const value = {
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
  };
  
  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
};
