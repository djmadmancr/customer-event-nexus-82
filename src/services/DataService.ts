import { Customer, Event, EventStatus, SelectableEventStatus, EventDetail, Payment, PaymentMethod } from '../types/models';
import { toast } from 'sonner';

// Helper function to generate unique IDs
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

class DataService {
  private customers: Customer[] = [];
  private events: Event[] = [];
  private eventDetails: EventDetail[] = [];
  private payments: Payment[] = [];

  constructor() {
    // Initialize with some sample data
    this.initSampleData();
  }

  // Helper method to update event status based on payments
  private updateEventStatusBasedOnPayments(eventId: string): void {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    const eventPayments = this.payments.filter(p => p.eventId === eventId);
    const totalPaid = eventPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // If total payments cover the event cost, mark as paid
    if (totalPaid >= event.cost && event.status !== 'paid') {
      event.status = 'paid';
      event.updatedAt = new Date();
    }
    // If total payments don't cover the cost and it was marked as paid, revert to delivered
    else if (totalPaid < event.cost && event.status === 'paid') {
      event.status = 'delivered';
      event.updatedAt = new Date();
    }
  }

  // ... keep existing code (initSampleData, getAllCustomers, getCustomerById, addCustomer, updateCustomer, deleteCustomer)

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
      venue: 'Oficina central',
      cost: 500,
      status: 'confirmed'
    });

    const event2 = this.addEvent({
      customerId: customer1.id,
      title: 'Presentación de propuesta',
      date: new Date(2025, 5, 30, 15, 0),
      venue: 'Sala de conferencias',
      cost: 1200,
      status: 'prospect'
    });

    const event3 = this.addEvent({
      customerId: customer2.id,
      title: 'Firma de contrato',
      date: new Date(2025, 6, 5, 11, 0),
      venue: 'Oficina del cliente',
      cost: 2500,
      status: 'delivered'
    });

    // Sample event details
    this.addEventDetail({
      eventId: event1.id,
      description: 'Proyector',
      quantity: 1,
      notes: 'Incluye pantalla'
    });

    this.addEventDetail({
      eventId: event1.id,
      description: 'Micrófono inalámbrico',
      quantity: 2,
      notes: 'Con baterías de repuesto'
    });

    // Sample payments
    this.addPayment({
      eventId: event3.id,
      amount: 2500,
      paymentDate: new Date(2025, 6, 5),
      method: 'transfer',
      notes: 'Pago completo'
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
    
    // Update status based on payments after event update
    this.updateEventStatusBasedOnPayments(id);
    
    toast.success('Evento actualizado exitosamente');
    return updatedEvent;
  }

  deleteEvent(id: string): boolean {
    const initialLength = this.events.length;
    this.events = this.events.filter(event => event.id !== id);
    
    // Also delete associated payments and details
    this.payments = this.payments.filter(payment => payment.eventId !== id);
    this.eventDetails = this.eventDetails.filter(detail => detail.eventId !== id);
    
    const success = this.events.length < initialLength;
    if (success) {
      toast.success('Evento eliminado exitosamente');
    } else {
      toast.error('Evento no encontrado');
    }
    
    return success;
  }

  // ... keep existing code (EVENT DETAILS METHODS, getEventDetailsByEventId, getEventDetailById, addEventDetail, updateEventDetail, deleteEventDetail)

  // EVENT DETAILS METHODS
  
  getAllEventDetails(): EventDetail[] {
    return [...this.eventDetails];
  }

  getEventDetailsByEventId(eventId: string): EventDetail[] {
    return this.eventDetails.filter(detail => detail.eventId === eventId);
  }

  getEventDetailById(id: string): EventDetail | undefined {
    return this.eventDetails.find(detail => detail.id === id);
  }

  addEventDetail(detailData: Omit<EventDetail, 'id' | 'createdAt' | 'updatedAt'>): EventDetail {
    const now = new Date();
    const newDetail: EventDetail = {
      id: generateId(),
      ...detailData,
      createdAt: now,
      updatedAt: now
    };
    
    this.eventDetails.push(newDetail);
    toast.success('Detalle agregado exitosamente');
    return newDetail;
  }

  updateEventDetail(id: string, detailData: Partial<Omit<EventDetail, 'id' | 'createdAt' | 'updatedAt'>>): EventDetail | undefined {
    const detailIndex = this.eventDetails.findIndex(detail => detail.id === id);
    
    if (detailIndex === -1) {
      toast.error('Detalle no encontrado');
      return undefined;
    }
    
    const updatedDetail: EventDetail = {
      ...this.eventDetails[detailIndex],
      ...detailData,
      updatedAt: new Date()
    };
    
    this.eventDetails[detailIndex] = updatedDetail;
    toast.success('Detalle actualizado exitosamente');
    return updatedDetail;
  }

  deleteEventDetail(id: string): boolean {
    const initialLength = this.eventDetails.length;
    this.eventDetails = this.eventDetails.filter(detail => detail.id !== id);
    
    const success = this.eventDetails.length < initialLength;
    if (success) {
      toast.success('Detalle eliminado exitosamente');
    } else {
      toast.error('Detalle no encontrado');
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
    
    // Update event status based on new payment
    this.updateEventStatusBasedOnPayments(paymentData.eventId);
    
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
    
    // Update event status based on payment changes
    this.updateEventStatusBasedOnPayments(updatedPayment.eventId);
    
    toast.success('Pago actualizado exitosamente');
    return updatedPayment;
  }

  deletePayment(id: string): boolean {
    const payment = this.payments.find(p => p.id === id);
    const eventId = payment?.eventId;
    
    const initialLength = this.payments.length;
    this.payments = this.payments.filter(payment => payment.id !== id);
    
    // Update event status after payment deletion
    if (eventId) {
      this.updateEventStatusBasedOnPayments(eventId);
    }
    
    const success = this.payments.length < initialLength;
    if (success) {
      toast.success('Pago eliminado exitosamente');
    } else {
      toast.error('Pago no encontrado');
    }
    
    return success;
  }

  // ... keep existing code (FINANCIAL SUMMARY METHODS)

  // FINANCIAL SUMMARY METHODS
  getEventsTotalByStatus(status: EventStatus): number {
    return this.events
      .filter(event => event.status === status)
      .reduce((total, event) => total + (event.cost || 0), 0);
  }

  getEventsTotalByStatusAndDateRange(status: EventStatus, startDate?: Date, endDate?: Date): number {
    return this.events
      .filter(event => {
        if (event.status !== status) return false;
        if (!startDate && !endDate) return true;
        if (startDate && event.date < startDate) return false;
        if (endDate && event.date > endDate) return false;
        return true;
      })
      .reduce((total, event) => total + (event.cost || 0), 0);
  }
}

// Create a singleton instance
const dataService = new DataService();
export default dataService;
