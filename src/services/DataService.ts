import { Customer, Event, Payment } from '../types/models';

class DataService {
  private currentUserId: string | null = null;

  setCurrentUserId(userId: string) {
    this.currentUserId = userId;
  }

  private getUserKey(key: string): string {
    const userId = this.currentUserId || this.getCurrentUserId();
    return `${key}_${userId}`;
  }

  private getCurrentUserId(): string {
    const savedUser = localStorage.getItem('demo-auth-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        return user.uid;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return 'demo-user'; // fallback
  }

  createUserProfile(userId: string): void {
    // Initialize empty data for new user
    localStorage.setItem(`customers_${userId}`, JSON.stringify([]));
    localStorage.setItem(`events_${userId}`, JSON.stringify([]));
    localStorage.setItem(`payments_${userId}`, JSON.stringify([]));
  }

  // Customer methods
  getAllCustomers(): Customer[] {
    const customers = localStorage.getItem(this.getUserKey('customers'));
    return customers ? JSON.parse(customers) : [];
  }

  addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
    const customers = this.getAllCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    customers.push(newCustomer);
    localStorage.setItem(this.getUserKey('customers'), JSON.stringify(customers));
    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const customers = this.getAllCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updates, updatedAt: new Date() };
      localStorage.setItem(this.getUserKey('customers'), JSON.stringify(customers));
      return customers[index];
    }
    return null;
  }

  deleteCustomer(id: string): boolean {
    const customers = this.getAllCustomers();
    const filteredCustomers = customers.filter(c => c.id !== id);
    localStorage.setItem(this.getUserKey('customers'), JSON.stringify(filteredCustomers));
    return filteredCustomers.length !== customers.length;
  }

  getCustomerById(id: string): Customer | null {
    const customers = this.getAllCustomers();
    return customers.find(c => c.id === id) || null;
  }

  // Event methods
  getAllEvents(): Event[] {
    const events = localStorage.getItem(this.getUserKey('events'));
    return events ? JSON.parse(events).map((event: any) => ({
      ...event,
      date: new Date(event.date),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    })) : [];
  }

  addEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event {
    const events = this.getAllEvents();
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    events.push(newEvent);
    localStorage.setItem(this.getUserKey('events'), JSON.stringify(events));
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<Event>): Event | null {
    const events = this.getAllEvents();
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...updates, updatedAt: new Date() };
      localStorage.setItem(this.getUserKey('events'), JSON.stringify(events));
      return events[index];
    }
    return null;
  }

  deleteEvent(id: string): boolean {
    const events = this.getAllEvents();
    const filteredEvents = events.filter(e => e.id !== id);
    localStorage.setItem(this.getUserKey('events'), JSON.stringify(filteredEvents));
    return filteredEvents.length !== events.length;
  }

  getEventById(id: string): Event | null {
    const events = this.getAllEvents();
    return events.find(e => e.id === id) || null;
  }

  getEventsByCustomerId(customerId: string): Event[] {
    const events = this.getAllEvents();
    return events.filter(e => e.customerId === customerId);
  }

  // Payment methods
  getAllPayments(): Payment[] {
    const payments = localStorage.getItem(this.getUserKey('payments'));
    return payments ? JSON.parse(payments).map((payment: any) => ({
      ...payment,
      paymentDate: new Date(payment.paymentDate),
      createdAt: new Date(payment.createdAt),
      updatedAt: new Date(payment.updatedAt),
    })) : [];
  }

  addPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment {
    const payments = this.getAllPayments();
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    payments.push(newPayment);
    localStorage.setItem(this.getUserKey('payments'), JSON.stringify(payments));
    return newPayment;
  }

  updatePayment(id: string, updates: Partial<Payment>): Payment | null {
    const payments = this.getAllPayments();
    const index = payments.findIndex(p => p.id === id);
    if (index !== -1) {
      payments[index] = { ...payments[index], ...updates, updatedAt: new Date() };
      localStorage.setItem(this.getUserKey('payments'), JSON.stringify(payments));
      return payments[index];
    }
    return null;
  }

  deletePayment(id: string): boolean {
    const payments = this.getAllPayments();
    const filteredPayments = payments.filter(p => p.id !== id);
    localStorage.setItem(this.getUserKey('payments'), JSON.stringify(filteredPayments));
    return filteredPayments.length !== payments.length;
  }

  getPaymentById(id: string): Payment | null {
    const payments = this.getAllPayments();
    return payments.find(p => p.id === id) || null;
  }

  getPaymentsByEventId(eventId: string): Payment[] {
    const payments = this.getAllPayments();
    return payments.filter(p => p.eventId === eventId);
  }
}

export default new DataService();
