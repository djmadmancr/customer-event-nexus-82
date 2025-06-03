
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
    console.log('Refreshing customers for user:', currentUser?.uid);
    setCustomers(dataService.getAllCustomers());
  };
  
  const refreshEvents = () => {
    console.log('Refreshing events for user:', currentUser?.uid);
    setEvents(dataService.getAllEvents());
  };
  
  const refreshPayments = () => {
    console.log('Refreshing payments for user:', currentUser?.uid);
    if (selectedEvent) {
      setPayments(dataService.getPaymentsByEventId(selectedEvent.id));
    } else {
      setPayments(dataService.getAllPayments());
    }
  };

  // Refresh all data when user changes
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
  React.useEffect(() => {
    console.log('Selected event changed:', selectedEvent?.id);
    if (selectedEvent) {
      setPayments(dataService.getPaymentsByEventId(selectedEvent.id));
    } else {
      setPayments([]);
    }
  }, [selectedEvent]);
  
  const value = {
    customers,
    selectedCustomer,
    setSelectedCustomer,
    refreshCustomers,
    
    events,
    selectedEvent,
    setSelectedEvent,
    refreshEvents,
    
    payments,
    refreshPayments,
  };
  
  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
};
