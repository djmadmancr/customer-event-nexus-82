import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Customer, Event, Payment } from '../types/models';
import dataService from '../services/DataService';
import { useAuth } from './AuthContext';

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const refreshCustomers = () => {
    if (currentUser) {
      console.log('Refreshing customers for user:', currentUser.uid);
      const customerData = dataService.getAllCustomers();
      setCustomers(customerData);
    }
  };
  
  const refreshEvents = () => {
    if (currentUser) {
      console.log('Refreshing events for user:', currentUser.uid);
      const eventData = dataService.getAllEvents();
      setEvents(eventData);
    }
  };
  
  const removeEvent = async (eventId: string): Promise<void> => {
    try {
      dataService.deleteEvent(eventId);
      refreshEvents();
    } catch (error) {
      console.error('Error removing event:', error);
      throw error;
    }
  };
  
  const refreshPayments = () => {
    if (currentUser) {
      console.log('Refreshing payments for user:', currentUser.uid);
      if (selectedEvent) {
        setPayments(dataService.getPaymentsByEventId(selectedEvent.id));
      } else {
        setPayments(dataService.getAllPayments());
      }
    }
  };

  // Initial data load when user changes
  useEffect(() => {
    console.log('User changed, refreshing all data:', currentUser?.uid);
    if (currentUser) {
      refreshCustomers();
      refreshEvents();
      setSelectedCustomer(null);
      setSelectedEvent(null);
      setPayments([]);
    } else {
      // Clear data if no user is logged in
      setCustomers([]);
      setEvents([]);
      setPayments([]);
      setSelectedCustomer(null);
      setSelectedEvent(null);
    }
  }, [currentUser?.uid]);
  
  // Update payments when selected event changes
  useEffect(() => {
    console.log('Selected event changed:', selectedEvent?.id);
    if (selectedEvent && currentUser) {
      setPayments(dataService.getPaymentsByEventId(selectedEvent.id));
    } else {
      setPayments([]);
    }
  }, [selectedEvent, currentUser]);
  
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