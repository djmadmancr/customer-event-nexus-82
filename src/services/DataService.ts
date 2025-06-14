import { Customer, Event, Payment, EventDetail } from '../types/models';

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
    const customerKey = this.getUserKey('customers');
    // Only create demo data if it doesn't exist for the user
    if (!localStorage.getItem(customerKey) || JSON.parse(localStorage.getItem(customerKey)!).length === 0) {
      const demoCustomers: Customer[] = [
        { id: 'demo-customer-1', name: 'Empresa Creativa S.A.', email: 'contacto@creativa.com', phone: '2233-4455', identificationNumber: '3-101-123456', notes: 'Cliente corporativo importante.', userId, createdAt: new Date(), updatedAt: new Date() },
        { id: 'demo-customer-2', name: 'Ana Sofía Solano', email: 'anasolano@email.com', phone: '8877-6655', identificationNumber: '1-1234-5678', notes: 'Boda en la playa.', userId, createdAt: new Date(), updatedAt: new Date() },
      ];
      localStorage.setItem(customerKey, JSON.stringify(demoCustomers));

      const demoEvents: Event[] = [
        { id: 'demo-event-1', customerId: 'demo-customer-1', title: 'Lanzamiento Producto X', date: new Date(new Date().setMonth(new Date().getMonth() - 1)), venue: 'Hotel Real Intercontinental', cost: 1500, totalWithTax: 1695, taxPercentage: 13, status: 'paid', category: 'corporate', userId, createdAt: new Date(), updatedAt: new Date(), comments: 'Evento de alto perfil.' },
        { id: 'demo-event-2', customerId: 'demo-customer-2', title: 'Boda Ana y Carlos', date: new Date(new Date().setDate(new Date().getDate() + 30)), venue: 'Reserva Conchal', cost: 2500, status: 'confirmed', category: 'wedding', userId, createdAt: new Date(), updatedAt: new Date(), comments: 'Requiere equipo de sonido para exteriores.' },
        { id: 'demo-event-3', customerId: 'demo-customer-2', title: 'Cumpleaños de Ana', date: new Date(new Date().setDate(new Date().getDate() - 10)), venue: 'Salón de eventos La Arboleda', cost: 800, status: 'show_completed', category: 'birthday', userId, createdAt: new Date(), updatedAt: new Date(), comments: 'Saldo pendiente.' },
      ];
      localStorage.setItem(this.getUserKey('events'), JSON.stringify(demoEvents));

      const demoPayments: Payment[] = [
        { id: 'demo-payment-1', eventId: 'demo-event-1', amount: 1695, currency: 'USD', paymentDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), method: 'transfer', createdAt: new Date(), updatedAt: new Date() },
        { id: 'demo-payment-2', eventId: 'demo-event-2', amount: 1250, currency: 'USD', paymentDate: new Date(), method: 'credit', createdAt: new Date(), updatedAt: new Date() },
      ];
      localStorage.setItem(this.getUserKey('payments'), JSON.stringify(demoPayments));
    }
    
    if (!localStorage.getItem(this.getUserKey('eventDetails'))) {
        localStorage.setItem(this.getUserKey('eventDetails'), JSON.stringify([]));
    }
  }

  // Currency formatting methods
  getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      USD: '$',
      CRC: '₡',
      EUR: '€',
      MXN: '$',
      COP: '$'
    };
    return symbols[currency] || '$';
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Customer methods
  getAllCustomers(): Customer[] {
    const customers = localStorage.getItem(this.getUserKey('customers'));
    return customers ? JSON.parse(customers).map((customer: any) => ({
      ...customer,
      createdAt: new Date(customer.createdAt),
      updatedAt: new Date(customer.updatedAt),
    })) : [];
  }

  addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
    const customers = this.getAllCustomers();
    const newCustomer: Customer = {
      ...customer,
      userId: customer.userId || this.getCurrentUserId(),
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
      userId: event.userId || this.getCurrentUserId(),
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

  // Event Tax methods
  addTaxToEvent(eventId: string, taxPercentage: number): Event | null {
    const event = this.getEventById(eventId);
    if (event) {
      const taxAmount = (event.cost * taxPercentage) / 100;
      const totalWithTax = event.cost + taxAmount;
      
      return this.updateEvent(eventId, {
        taxPercentage,
        taxAmount,
        totalWithTax
      });
    }
    return null;
  }

  removeTaxFromEvent(eventId: string): Event | null {
    return this.updateEvent(eventId, {
      taxPercentage: undefined,
      taxAmount: undefined,
      totalWithTax: undefined
    });
  }

  // Financial analysis methods
  getEventsTotalByStatusAndDateRange(status: string, startDate: Date, endDate: Date): number {
    const events = this.getAllEvents();
    return events
      .filter(event => 
        event.status === status && 
        event.date >= startDate && 
        event.date <= endDate
      )
      .reduce((total, event) => total + event.cost, 0);
  }

  // Event Details methods
  getAllEventDetails(): EventDetail[] {
    const details = localStorage.getItem(this.getUserKey('eventDetails'));
    return details ? JSON.parse(details).map((detail: any) => ({
      ...detail,
      createdAt: new Date(detail.createdAt),
      updatedAt: new Date(detail.updatedAt),
    })) : [];
  }

  getEventDetailsByEventId(eventId: string): EventDetail[] {
    const details = this.getAllEventDetails();
    return details.filter(d => d.eventId === eventId);
  }

  getEventDetailById(id: string): EventDetail | null {
    const details = this.getAllEventDetails();
    return details.find(d => d.id === id) || null;
  }

  addEventDetail(detail: Omit<EventDetail, 'id' | 'createdAt' | 'updatedAt'>): EventDetail {
    const details = this.getAllEventDetails();
    const newDetail: EventDetail = {
      ...detail,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    details.push(newDetail);
    localStorage.setItem(this.getUserKey('eventDetails'), JSON.stringify(details));
    return newDetail;
  }

  updateEventDetail(id: string, updates: Partial<EventDetail>): EventDetail | null {
    const details = this.getAllEventDetails();
    const index = details.findIndex(d => d.id === id);
    if (index !== -1) {
      details[index] = { ...details[index], ...updates, updatedAt: new Date() };
      localStorage.setItem(this.getUserKey('eventDetails'), JSON.stringify(details));
      return details[index];
    }
    return null;
  }

  deleteEventDetail(id: string): boolean {
    const details = this.getAllEventDetails();
    const filteredDetails = details.filter(d => d.id !== id);
    localStorage.setItem(this.getUserKey('eventDetails'), JSON.stringify(filteredDetails));
    return filteredDetails.length !== details.length;
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
