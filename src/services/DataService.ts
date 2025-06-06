import { Customer, Event, EventStatus, SelectableEventStatus, EventDetail, Payment, PaymentMethod, Currency } from '../types/models';
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
    // Initialize with demo data only for the specific demo user
    this.initDemoDataForSpecificUser();
  }

  // Get current user ID from auth context
  private getCurrentUserId(): string {
    const authUser = localStorage.getItem('demo-auth-user');
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        return user.uid;
      } catch (error) {
        console.error('Error getting current user ID:', error);
      }
    }
    return '';
  }

  // Helper method to calculate event totals with tax
  private calculateEventTotals(event: Event): Event {
    const taxAmount = event.taxPercentage ? (event.cost * event.taxPercentage) / 100 : 0;
    const totalWithTax = event.cost + taxAmount;
    
    return {
      ...event,
      taxAmount,
      totalWithTax
    };
  }

  // Helper method to update event status based on payments
  private updateEventStatusBasedOnPayments(eventId: string): void {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    const eventPayments = this.payments.filter(p => p.eventId === eventId);
    const totalPaid = eventPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const eventTotal = event.totalWithTax || event.cost;
    
    // If total payments cover the event cost, mark as paid
    if (totalPaid >= eventTotal && event.status !== 'paid') {
      event.status = 'paid';
      event.updatedAt = new Date();
    }
    // If total payments don't cover the cost and it was marked as paid, revert to show_completed
    else if (totalPaid < eventTotal && event.status === 'paid') {
      // Only revert if it was automatically set to paid
      if (event.status === 'paid') {
        event.status = 'show_completed';
        event.updatedAt = new Date();
      }
    }
  }

  private initDemoDataForSpecificUser() {
    // ONLY create demo data for the specific demo user email
    const DEMO_USER_EMAIL = 'djmadmancr@gmail.com';
    const DEMO_USER_ID = 'demo-admin';
    
    // Check if current user is the demo user
    const authUser = localStorage.getItem('demo-auth-user');
    let isDemoUser = false;
    
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        isDemoUser = user.email === DEMO_USER_EMAIL;
      } catch (error) {
        console.log('No auth user found');
      }
    }

    // Only initialize demo data if this is the demo user
    if (!isDemoUser) {
      console.log('✅ New user profile initialized - no demo data');
      return;
    }

    // Get default tax from localStorage
    const defaultTaxPercentage = localStorage.getItem('defaultTaxPercentage');
    const taxPercentage = defaultTaxPercentage ? parseFloat(defaultTaxPercentage) : 13;
    
    // Create demo data only for the admin user
    const adminUserId = DEMO_USER_ID;
    
    // Create 12 customers for admin user
    const customers = [
      this.addCustomerForUser({
        name: 'Juan Pérez Rodríguez',
        email: 'juan.perez@example.com',
        phone: '+506 8888-9999',
        notes: 'Cliente preferente desde 2020'
      }, adminUserId),
      this.addCustomerForUser({
        name: 'María González Jiménez',
        email: 'maria.gonzalez@example.com',
        phone: '+506 7777-8888',
        notes: 'Contactar preferentemente por email'
      }, adminUserId),
      this.addCustomerForUser({
        name: 'Carlos Mendoza López',
        email: 'carlos.mendoza@example.com',
        phone: '+506 6666-7777',
        notes: 'Organizador de eventos corporativos'
      }, adminUserId),
      this.addCustomerForUser({
        name: 'Ana Sofía Vargas',
        email: 'ana.vargas@example.com',
        phone: '+506 5555-6666',
        notes: 'Especialista en bodas'
      }, adminUserId),
      this.addCustomerForUser({
        name: 'Roberto Chen Wang',
        email: 'roberto.chen@example.com',
        phone: '+506 4444-5555',
        notes: 'Cliente corporativo, eventos trimestrales'
      }, adminUserId),
      this.addCustomerForUser({
        name: 'Patricia Morales Vega',
        email: 'patricia.morales@example.com',
        phone: '+506 3333-4444',
        notes: 'Organizadora de quinceañeras'
      }, adminUserId),
      this.addCustomerForUser({
        name: 'Diego Ramírez Castro',
        email: 'diego.ramirez@example.com',
        phone: '+506 2222-3333',
        notes: 'DJ local, colaboraciones frecuentes'
      }, adminUserId),
      this.addCustomerForUser({
        name: 'Lucía Fernández Soto',
        email: 'lucia.fernandez@example.com',
        phone: '+506 1111-2222',
        notes: 'Eventos familiares pequeños'
      }, adminUserId),
      this.addCustomerForUser({
        name: 'Miguel Ángel Herrera',
        email: 'miguel.herrera@example.com',
        phone: '+506 9999-0000',
        notes: 'Cliente VIP, eventos de alta gama'
      }, adminUserId),
      this.addCustomerForUser({
        name: 'Valeria Cordero Ruiz',
        email: 'valeria.cordero@example.com',
        phone: '+506 8888-1111',
        notes: 'Eventos universitarios y juveniles'
      }, adminUserId),
      this.addCustomerForUser({
        name: 'Andrés Solano Quesada',
        email: 'andres.solano@example.com',
        phone: '+506 7777-2222',
        notes: 'Eventos deportivos y celebraciones'
      }, adminUserId),
      this.addCustomerForUser({
        name: 'Isabella Rojas Montero',
        email: 'isabella.rojas@example.com',
        phone: '+506 6666-3333',
        notes: 'Fiestas temáticas y cumpleaños infantiles'
      }, adminUserId)
    ];

    // Create events for the last 12 months (at least 1 per month) for admin user
    const currentDate = new Date();
    const events = [];

    // Array of event types and venues for variety
    const eventTypes = [
      'Fiesta de Cumpleaños', 'Boda', 'Quinceañera', 'Evento Corporativo', 
      'Baby Shower', 'Graduación', 'Aniversario', 'Concierto', 
      'Festival', 'Presentación de Producto', 'Cena de Gala', 'Fiesta Temática'
    ];

    const venues = [
      'Salón de Eventos Los Arcos', 'Hotel Costa Rica Marriott', 'Club Campestre',
      'Iglesia San José', 'Centro de Convenciones', 'Quinta Los Laureles',
      'Hotel Presidente', 'Casa Corcovado', 'Hacienda Los Reyes', 'Beach Club Guanacaste',
      'Teatro Nacional', 'Auditorio Universidad', 'Salón Real Palace'
    ];

    // Generate events for each of the last 12 months
    for (let monthsAgo = 0; monthsAgo < 12; monthsAgo++) {
      const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthsAgo, 15);
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const randomVenue = venues[Math.floor(Math.random() * venues.length)];
      
      // Determine status based on date
      let status: EventStatus;
      if (monthsAgo > 2) {
        status = Math.random() > 0.3 ? 'paid' : 'show_completed';
      } else if (monthsAgo > 0) {
        status = Math.random() > 0.5 ? 'show_completed' : 'confirmed';
      } else {
        status = Math.random() > 0.7 ? 'confirmed' : 'prospect';
      }

      const cost = Math.floor(Math.random() * 800000) + 150000; // Between 150k and 950k
      
      const event = this.addEventForUser({
        customerId: randomCustomer.id,
        title: randomEventType,
        date: eventDate,
        venue: randomVenue,
        cost: cost,
        taxPercentage: taxPercentage,
        status: status
      }, adminUserId);

      events.push(event);

      // Add some additional events for variety (2-3 events per month for some months)
      if (Math.random() > 0.4) {
        const additionalEventDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthsAgo, Math.floor(Math.random() * 28) + 1);
        const anotherCustomer = customers[Math.floor(Math.random() * customers.length)];
        const anotherEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const anotherVenue = venues[Math.floor(Math.random() * venues.length)];
        
        let additionalStatus: EventStatus;
        if (monthsAgo > 2) {
          additionalStatus = Math.random() > 0.2 ? 'paid' : 'show_completed';
        } else if (monthsAgo > 0) {
          additionalStatus = Math.random() > 0.4 ? 'show_completed' : 'confirmed';
        } else {
          additionalStatus = Math.random() > 0.6 ? 'confirmed' : 'prospect';
        }

        const additionalCost = Math.floor(Math.random() * 600000) + 200000;
        
        const additionalEvent = this.addEventForUser({
          customerId: anotherCustomer.id,
          title: anotherEventType,
          date: additionalEventDate,
          venue: anotherVenue,
          cost: additionalCost,
          taxPercentage: taxPercentage,
          status: additionalStatus
        }, adminUserId);

        events.push(additionalEvent);
      }
    }

    // Add some event details for recent events
    const recentEvents = events.slice(0, 8);
    recentEvents.forEach(event => {
      // Add 1-3 details per event
      const numDetails = Math.floor(Math.random() * 3) + 1;
      const equipmentTypes = [
        'Equipo de sonido profesional', 'Luces LED', 'Micrófono inalámbrico',
        'Sistema de proyección', 'DJ Booth', 'Altavoces adicionales',
        'Iluminación ambiente', 'Equipo para karaoke', 'Mesa de mezclas'
      ];
      
      for (let i = 0; i < numDetails; i++) {
        const equipment = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
        this.addEventDetailForUser({
          eventId: event.id,
          description: equipment,
          quantity: Math.floor(Math.random() * 4) + 1,
          notes: i === 0 ? 'Equipo principal del evento' : 'Equipo adicional'
        }, adminUserId);
      }
    });

    // Add payments for show_completed and paid events - FIXED: changed 'card' to 'credit'
    const paidEvents = events.filter(e => e.status === 'paid' || e.status === 'show_completed');
    paidEvents.forEach(event => {
      if (Math.random() > 0.3) { // 70% of events have payments
        const paymentMethods: PaymentMethod[] = ['cash', 'transfer', 'credit']; // FIXED: 'card' -> 'credit'
        const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        // For paid events, add full payment
        if (event.status === 'paid') {
          this.addPaymentForUser({
            eventId: event.id,
            amount: event.totalWithTax || event.cost,
            currency: 'CRC',
            paymentDate: new Date(event.date.getTime() + (Math.random() * 7 * 24 * 60 * 60 * 1000)), // Within a week after event
            method: randomMethod,
            notes: 'Pago completo del evento'
          }, adminUserId);
        } else {
          // For show_completed events, add partial payment
          const partialAmount = Math.floor((event.totalWithTax || event.cost) * (0.3 + Math.random() * 0.4)); // 30-70% of total
          this.addPaymentForUser({
            eventId: event.id,
            amount: partialAmount,
            currency: 'CRC',
            paymentDate: new Date(event.date.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000)), // Up to 30 days before event
            method: randomMethod,
            notes: 'Pago parcial - anticipo'
          }, adminUserId);
        }
      }
    });

    console.log(`✅ Demo data initialized for demo user: ${customers.length} customers, ${events.length} events`);
  }

  // CUSTOMER METHODS - Updated to filter by user
  
  getAllCustomers(): Customer[] {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return [];
    return this.customers.filter(customer => customer.userId === currentUserId);
  }

  getCustomerById(id: string): Customer | undefined {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return undefined;
    const customer = this.customers.find(customer => customer.id === id);
    // Verify the customer belongs to the current user
    if (customer && customer.userId === currentUserId) {
      return customer;
    }
    return undefined;
  }

  addCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Customer {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      toast.error('Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }
    return this.addCustomerForUser(customerData, currentUserId);
  }

  private addCustomerForUser(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, userId: string): Customer {
    const now = new Date();
    const newCustomer: Customer = {
      id: generateId(),
      ...customerData,
      userId,
      createdAt: now,
      updatedAt: now
    };
    
    this.customers.push(newCustomer);
    if (userId === this.getCurrentUserId()) {
      toast.success('Cliente creado exitosamente');
    }
    return newCustomer;
  }

  updateCustomer(id: string, customerData: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>): Customer | undefined {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      toast.error('Usuario no autenticado');
      return undefined;
    }
    const customerIndex = this.customers.findIndex(customer => customer.id === id && customer.userId === currentUserId);
    
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
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      toast.error('Usuario no autenticado');
      return false;
    }
    const customerToDelete = this.customers.find(c => c.id === id && c.userId === currentUserId);
    
    if (!customerToDelete) {
      toast.error('Cliente no encontrado');
      return false;
    }
    
    this.customers = this.customers.filter(customer => customer.id !== id);
    
    // Also delete associated events and their payments
    const customerEvents = this.events.filter(event => event.customerId === id && event.userId === currentUserId);
    customerEvents.forEach(event => {
      this.deleteEvent(event.id);
    });
    
    toast.success('Cliente eliminado exitosamente');
    return true;
  }

  // EVENT METHODS - Updated to filter by user
  
  getAllEvents(): Event[] {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return [];
    return this.events.filter(event => event.userId === currentUserId);
  }

  getEventsByCustomerId(customerId: string): Event[] {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return [];
    return this.events.filter(event => event.customerId === customerId && event.userId === currentUserId);
  }

  getEventById(id: string): Event | undefined {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return undefined;
    const event = this.events.find(event => event.id === id);
    if (event && event.userId === currentUserId) {
      return event;
    }
    return undefined;
  }

  addEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'taxAmount' | 'totalWithTax' | 'userId'>): Event {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      toast.error('Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }
    return this.addEventForUser(eventData, currentUserId);
  }

  private addEventForUser(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'taxAmount' | 'totalWithTax' | 'userId'>, userId: string): Event {
    // Verify the customer belongs to the current user (only if not creating demo data)
    if (userId === this.getCurrentUserId()) {
      const customer = this.getCustomerById(eventData.customerId);
      if (!customer) {
        toast.error('Cliente no encontrado o no autorizado');
        throw new Error('Cliente no encontrado o no autorizado');
      }
    }
    
    const now = new Date();
    
    // Get default tax from localStorage if not provided
    if (!eventData.taxPercentage) {
      const defaultTaxPercentage = localStorage.getItem('defaultTaxPercentage');
      eventData.taxPercentage = defaultTaxPercentage ? parseFloat(defaultTaxPercentage) : 13;
    }
    
    let newEvent: Event = {
      id: generateId(),
      ...eventData,
      userId: userId,
      createdAt: now,
      updatedAt: now
    };
    
    // Calculate totals with tax
    newEvent = this.calculateEventTotals(newEvent);
    
    this.events.push(newEvent);
    if (userId === this.getCurrentUserId()) {
      toast.success('Evento creado exitosamente');
    }
    return newEvent;
  }

  updateEvent(id: string, eventData: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'taxAmount' | 'totalWithTax' | 'userId'>>): Event | undefined {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      toast.error('Usuario no autenticado');
      return undefined;
    }
    const eventIndex = this.events.findIndex(event => event.id === id && event.userId === currentUserId);
    
    if (eventIndex === -1) {
      toast.error('Evento no encontrado');
      return undefined;
    }
    
    let updatedEvent: Event = {
      ...this.events[eventIndex],
      ...eventData,
      updatedAt: new Date()
    };
    
    // Recalculate totals with tax
    updatedEvent = this.calculateEventTotals(updatedEvent);
    
    this.events[eventIndex] = updatedEvent;
    
    // Update status based on payments after event update
    this.updateEventStatusBasedOnPayments(id);
    
    toast.success('Evento actualizado exitosamente');
    return updatedEvent;
  }

  deleteEvent(id: string): boolean {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      toast.error('Usuario no autenticado');
      return false;
    }
    const eventToDelete = this.events.find(e => e.id === id && e.userId === currentUserId);
    
    if (!eventToDelete) {
      toast.error('Evento no encontrado');
      return false;
    }
    
    this.events = this.events.filter(event => event.id !== id);
    
    // Also delete associated payments and details
    this.payments = this.payments.filter(payment => payment.eventId !== id);
    this.eventDetails = this.eventDetails.filter(detail => detail.eventId !== id);
    
    toast.success('Evento eliminado exitosamente');
    return true;
  }

  // Add tax to event
  addTaxToEvent(eventId: string, taxPercentage: number): Event | undefined {
    return this.updateEvent(eventId, { taxPercentage });
  }

  // Remove tax from event
  removeTaxFromEvent(eventId: string): Event | undefined {
    return this.updateEvent(eventId, { taxPercentage: 0 });
  }

  // EVENT DETAILS METHODS - Updated to check event ownership
  
  getAllEventDetails(): EventDetail[] {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return [];
    const userEventIds = this.events.filter(e => e.userId === currentUserId).map(e => e.id);
    return this.eventDetails.filter(detail => userEventIds.includes(detail.eventId));
  }

  getEventDetailsByEventId(eventId: string): EventDetail[] {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return [];
    const event = this.getEventById(eventId);
    if (!event) return [];
    
    return this.eventDetails.filter(detail => detail.eventId === eventId);
  }

  getEventDetailById(id: string): EventDetail | undefined {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return undefined;
    const detail = this.eventDetails.find(detail => detail.id === id);
    if (!detail) return undefined;
    
    // Check if the event belongs to the current user
    const event = this.getEventById(detail.eventId);
    return event ? detail : undefined;
  }

  addEventDetail(detailData: Omit<EventDetail, 'id' | 'createdAt' | 'updatedAt'>): EventDetail {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      toast.error('Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }
    return this.addEventDetailForUser(detailData, currentUserId);
  }

  private addEventDetailForUser(detailData: Omit<EventDetail, 'id' | 'createdAt' | 'updatedAt'>, userId: string): EventDetail {
    // Verify event exists and belongs to user (only if not creating demo data)
    if (userId === this.getCurrentUserId()) {
      const event = this.getEventById(detailData.eventId);
      if (!event) {
        toast.error('Evento no encontrado o no autorizado');
        throw new Error('Evento no encontrado o no autorizado');
      }
    }
    
    const now = new Date();
    const newDetail: EventDetail = {
      id: generateId(),
      ...detailData,
      createdAt: now,
      updatedAt: now
    };
    
    this.eventDetails.push(newDetail);
    if (userId === this.getCurrentUserId()) {
      toast.success('Detalle agregado exitosamente');
    }
    return newDetail;
  }

  updateEventDetail(id: string, detailData: Partial<Omit<EventDetail, 'id' | 'createdAt' | 'updatedAt'>>): EventDetail | undefined {
    const detail = this.getEventDetailById(id);
    if (!detail) {
      toast.error('Detalle no encontrado');
      return undefined;
    }
    
    const detailIndex = this.eventDetails.findIndex(d => d.id === id);
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
    const detail = this.getEventDetailById(id);
    if (!detail) {
      toast.error('Detalle no encontrado');
      return false;
    }
    
    this.eventDetails = this.eventDetails.filter(detail => detail.id !== id);
    toast.success('Detalle eliminado exitosamente');
    return true;
  }

  // PAYMENT METHODS - Updated to check event ownership
  
  getAllPayments(): Payment[] {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return [];
    const userEventIds = this.events.filter(e => e.userId === currentUserId).map(e => e.id);
    return this.payments.filter(payment => userEventIds.includes(payment.eventId));
  }

  getPaymentsByEventId(eventId: string): Payment[] {
    const event = this.getEventById(eventId);
    if (!event) return [];
    
    return this.payments.filter(payment => payment.eventId === eventId);
  }

  getPaymentById(id: string): Payment | undefined {
    const payment = this.payments.find(payment => payment.id === id);
    if (!payment) return undefined;
    
    // Check if the event belongs to the current user
    const event = this.getEventById(payment.eventId);
    return event ? payment : undefined;
  }

  addPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      toast.error('Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }
    return this.addPaymentForUser(paymentData, currentUserId);
  }

  private addPaymentForUser(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Payment {
    // Verify event exists and belongs to user (only if not creating demo data)
    if (userId === this.getCurrentUserId()) {
      const event = this.getEventById(paymentData.eventId);
      if (!event) {
        toast.error('Evento no encontrado o no autorizado');
        throw new Error('Evento no encontrado o no autorizado');
      }
    }
    
    const now = new Date();
    const newPayment: Payment = {
      id: generateId(),
      ...paymentData,
      currency: paymentData.currency || 'CRC', // Default to Costa Rican Colones
      createdAt: now,
      updatedAt: now
    };
    
    this.payments.push(newPayment);
    
    // Update event status based on new payment
    this.updateEventStatusBasedOnPayments(paymentData.eventId);
    
    if (userId === this.getCurrentUserId()) {
      toast.success('Pago registrado exitosamente');
    }
    return newPayment;
  }

  updatePayment(id: string, paymentData: Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>>): Payment | undefined {
    const payment = this.getPaymentById(id);
    if (!payment) {
      toast.error('Pago no encontrado');
      return undefined;
    }
    
    const paymentIndex = this.payments.findIndex(p => p.id === id);
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
    const payment = this.getPaymentById(id);
    if (!payment) {
      toast.error('Pago no encontrado');
      return false;
    }
    
    const eventId = payment.eventId;
    this.payments = this.payments.filter(p => p.id !== id);
    
    // Update event status after payment deletion
    this.updateEventStatusBasedOnPayments(eventId);
    
    toast.success('Pago eliminado exitosamente');
    return true;
  }

  // CURRENCY HELPER METHODS
  getCurrencySymbol(currency: Currency): string {
    switch (currency) {
      case 'USD': return '$';
      case 'CRC': return '₡';
      case 'EUR': return '€';
      default: return '₡';
    }
  }

  formatCurrency(amount: number, currency: Currency = 'CRC'): string {
    const symbol = this.getCurrencySymbol(currency);
    return `${symbol}${amount.toLocaleString('es-CR')}`;
  }

  // FINANCIAL SUMMARY METHODS - Updated to filter by user
  getEventsTotalByStatus(status: EventStatus): number {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return 0;
    return this.events
      .filter(event => event.status === status && event.userId === currentUserId)
      .reduce((total, event) => total + (event.totalWithTax || event.cost || 0), 0);
  }

  getEventsTotalByStatusAndDateRange(status: EventStatus, startDate?: Date, endDate?: Date): number {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return 0;
    return this.events
      .filter(event => {
        if (event.status !== status || event.userId !== currentUserId) return false;
        if (!startDate && !endDate) return true;
        if (startDate && event.date < startDate) return false;
        if (endDate && event.date > endDate) return false;
        return true;
      })
      .reduce((total, event) => total + (event.totalWithTax || event.cost || 0), 0);
  }

  // Create initial profile for new user
  createUserProfile(userId: string): void {
    // This method is called when a new user registers
    // It doesn't create any initial data, the user will create their own
    console.log(`✅ User profile space created for user: ${userId}`);
  }

  // Clear all data for current user (for testing purposes)
  clearUserData(): void {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return;
    
    this.customers = this.customers.filter(c => c.userId !== currentUserId);
    this.events = this.events.filter(e => e.userId !== currentUserId);
    this.eventDetails = this.eventDetails.filter(d => {
      const eventExists = this.events.some(e => e.id === d.eventId);
      return eventExists;
    });
    this.payments = this.payments.filter(p => {
      const eventExists = this.events.some(e => e.id === p.eventId);
      return eventExists;
    });
    
    console.log(`✅ User data cleared for user: ${currentUserId}`);
  }
}

// Create a singleton instance
const dataService = new DataService();
export default dataService;
