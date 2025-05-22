
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Customer, Event, Payment } from '../types/models';
import dataService from '../services/DataService';

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
  const [customers, setCustomers] = useState<Customer[]>(dataService.getAllCustomers());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [events, setEvents] = useState<Event[]>(dataService.getAllEvents());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const [payments, setPayments] = useState<Payment[]>(dataService.getAllPayments());
  
  const refreshCustomers = () => {
    setCustomers(dataService.getAllCustomers());
  };
  
  const refreshEvents = () => {
    setEvents(dataService.getAllEvents());
    
    // If we have a selected customer, filter events for that customer
    if (selectedCustomer) {
      setEvents(dataService.getEventsByCustomerId(selectedCustomer.id));
    } else {
      setEvents(dataService.getAllEvents());
    }
  };
  
  const refreshPayments = () => {
    if (selectedEvent) {
      setPayments(dataService.getPaymentsByEventId(selectedEvent.id));
    } else {
      setPayments(dataService.getAllPayments());
    }
  };
  
  // Update events when selected customer changes
  React.useEffect(() => {
    if (selectedCustomer) {
      setEvents(dataService.getEventsByCustomerId(selectedCustomer.id));
    } else {
      setEvents(dataService.getAllEvents());
    }
    
    // Clear selected event when changing customers
    setSelectedEvent(null);
  }, [selectedCustomer]);
  
  // Update payments when selected event changes
  React.useEffect(() => {
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
