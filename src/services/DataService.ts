
import { Customer, Event, EventStatus, Payment, PaymentMethod } from '../types/models';
import { toast } from 'sonner';

// Helper function to generate unique IDs
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

class DataService {
  private customers: Customer[] = [];
  private events: Event[] = [];
  private payments: Payment[] = [];

  constructor() {
    // Initialize with some sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Sample customers
    const customer1 = this.addCustomer({
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      phone: '+34 612 345 678',
      notes: 'Cliente preferente'
    });

    const customer2 = this.addCustomer({
      name: 'María González',
      email: 'maria.gonzalez@example.com',
      phone: '+34 623 456 789',
      notes: 'Contactar preferentemente por email'
    });

    // Sample events
    const event1 = this.addEvent({
      customerId: customer1.id,
      title: 'Reunión inicial',
      date: new Date(2025, 5, 25, 10, 0),
      status: 'confirmed'
    });

    const event2 = this.addEvent({
      customerId: customer1.id,
      title: 'Presentación de propuesta',
      date: new Date(2025, 5, 30, 15, 0),
      status: 'pending'
    });

    const event3 = this.addEvent({
      customerId: customer2.id,
      title: 'Firma de contrato',
      date: new Date(2025, 6, 5, 11, 0),
      status: 'completed'
    });

    // Sample payments
    this.addPayment({
      eventId: event3.id,
      amount: 1500,
      paymentDate: new Date(2025, 6, 5),
      method: 'transfer',
      notes: 'Pago inicial'
    });
  }

  // CUSTOMER METHODS
  
  getAllCustomers(): Customer[] {
    return [...this.customers];
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers.find(customer => customer.id === id);
  }

  addCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
    const now = new Date();
    const newCustomer: Customer = {
      id: generateId(),
      ...customerData,
      createdAt: now,
      updatedAt: now
    };
    
    this.customers.push(newCustomer);
    toast.success('Cliente creado exitosamente');
    return newCustomer;
  }

  updateCustomer(id: string, customerData: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>): Customer | undefined {
    const customerIndex = this.customers.findIndex(customer => customer.id === id);
    
    if (customerIndex === -1) {
      toast.error('Cliente no encontrado');
      return undefined;
    }
    
    const updatedCustomer: Customer = {
      ...this.customers[customerIndex],
      ...customerData,
      updatedAt: new Date()
    };
    
    this.customers[customerIndex] = updatedCustomer;
    toast.success('Cliente actualizado exitosamente');
    return updatedCustomer;
  }

  deleteCustomer(id: string): boolean {
    const initialLength = this.customers.length;
    this.customers = this.customers.filter(customer => customer.id !== id);
    
    // Also delete associated events and their payments
    const customerEvents = this.events.filter(event => event.customerId === id);
    customerEvents.forEach(event => {
      this.deleteEvent(event.id);
    });
    
    const success = this.customers.length < initialLength;
    if (success) {
      toast.success('Cliente eliminado exitosamente');
    } else {
      toast.error('Cliente no encontrado');
    }
    
    return success;
  }

  // EVENT METHODS
  
  getAllEvents(): Event[] {
    return [...this.events];
  }

  getEventsByCustomerId(customerId: string): Event[] {
    return this.events.filter(event => event.customerId === customerId);
  }

  getEventById(id: string): Event | undefined {
    return this.events.find(event => event.id === id);
  }

  addEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event {
    const now = new Date();
    const newEvent: Event = {
      id: generateId(),
      ...eventData,
      createdAt: now,
      updatedAt: now
    };
    
    this.events.push(newEvent);
    toast.success('Evento creado exitosamente');
    return newEvent;
  }

  updateEvent(id: string, eventData: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>): Event | undefined {
    const eventIndex = this.events.findIndex(event => event.id === id);
    
    if (eventIndex === -1) {
      toast.error('Evento no encontrado');
      return undefined;
    }
    
    const updatedEvent: Event = {
      ...this.events[eventIndex],
      ...eventData,
      updatedAt: new Date()
    };
    
    this.events[eventIndex] = updatedEvent;
    toast.success('Evento actualizado exitosamente');
    return updatedEvent;
  }

  deleteEvent(id: string): boolean {
    const initialLength = this.events.length;
    this.events = this.events.filter(event => event.id !== id);
    
    // Also delete associated payments
    this.payments = this.payments.filter(payment => payment.eventId !== id);
    
    const success = this.events.length < initialLength;
    if (success) {
      toast.success('Evento eliminado exitosamente');
    } else {
      toast.error('Evento no encontrado');
    }
    
    return success;
  }

  // PAYMENT METHODS
  
  getAllPayments(): Payment[] {
    return [...this.payments];
  }

  getPaymentsByEventId(eventId: string): Payment[] {
    return this.payments.filter(payment => payment.eventId === eventId);
  }

  getPaymentById(id: string): Payment | undefined {
    return this.payments.find(payment => payment.id === id);
  }

  addPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment {
    const now = new Date();
    const newPayment: Payment = {
      id: generateId(),
      ...paymentData,
      createdAt: now,
      updatedAt: now
    };
    
    this.payments.push(newPayment);
    toast.success('Pago registrado exitosamente');
    return newPayment;
  }

  updatePayment(id: string, paymentData: Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>>): Payment | undefined {
    const paymentIndex = this.payments.findIndex(payment => payment.id === id);
    
    if (paymentIndex === -1) {
      toast.error('Pago no encontrado');
      return undefined;
    }
    
    const updatedPayment: Payment = {
      ...this.payments[paymentIndex],
      ...paymentData,
      updatedAt: new Date()
    };
    
    this.payments[paymentIndex] = updatedPayment;
    toast.success('Pago actualizado exitosamente');
    return updatedPayment;
  }

  deletePayment(id: string): boolean {
    const initialLength = this.payments.length;
    this.payments = this.payments.filter(payment => payment.id !== id);
    
    const success = this.payments.length < initialLength;
    if (success) {
      toast.success('Pago eliminado exitosamente');
    } else {
      toast.error('Pago no encontrado');
    }
    
    return success;
  }
}

// Create a singleton instance
const dataService = new DataService();
export default dataService;
