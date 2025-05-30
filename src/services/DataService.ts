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
    // Initialize with enhanced sample data
    this.initSampleData();
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
    // If total payments don't cover the cost and it was marked as paid, revert to delivered
    else if (totalPaid < eventTotal && event.status === 'paid') {
      // Only revert if it was automatically set to paid
      if (event.status === 'paid') {
        event.status = 'delivered';
        event.updatedAt = new Date();
      }
    }
  }

  private initSampleData() {
    // Get default tax from localStorage
    const defaultTaxPercentage = localStorage.getItem('defaultTaxPercentage');
    const taxPercentage = defaultTaxPercentage ? parseFloat(defaultTaxPercentage) : 13;
    
    // Create 12 customers
    const customers = [
      this.addCustomer({
        name: 'Juan Pérez Rodríguez',
        email: 'juan.perez@example.com',
        phone: '+506 8888-9999',
        notes: 'Cliente preferente desde 2020'
      }),
      this.addCustomer({
        name: 'María González Jiménez',
        email: 'maria.gonzalez@example.com',
        phone: '+506 7777-8888',
        notes: 'Contactar preferentemente por email'
      }),
      this.addCustomer({
        name: 'Carlos Mendoza López',
        email: 'carlos.mendoza@example.com',
        phone: '+506 6666-7777',
        notes: 'Organizador de eventos corporativos'
      }),
      this.addCustomer({
        name: 'Ana Sofía Vargas',
        email: 'ana.vargas@example.com',
        phone: '+506 5555-6666',
        notes: 'Especialista en bodas'
      }),
      this.addCustomer({
        name: 'Roberto Chen Wang',
        email: 'roberto.chen@example.com',
        phone: '+506 4444-5555',
        notes: 'Cliente corporativo, eventos trimestrales'
      }),
      this.addCustomer({
        name: 'Patricia Morales Vega',
        email: 'patricia.morales@example.com',
        phone: '+506 3333-4444',
        notes: 'Organizadora de quinceañeras'
      }),
      this.addCustomer({
        name: 'Diego Ramírez Castro',
        email: 'diego.ramirez@example.com',
        phone: '+506 2222-3333',
        notes: 'DJ local, colaboraciones frecuentes'
      }),
      this.addCustomer({
        name: 'Lucía Fernández Soto',
        email: 'lucia.fernandez@example.com',
        phone: '+506 1111-2222',
        notes: 'Eventos familiares pequeños'
      }),
      this.addCustomer({
        name: 'Miguel Ángel Herrera',
        email: 'miguel.herrera@example.com',
        phone: '+506 9999-0000',
        notes: 'Cliente VIP, eventos de alta gama'
      }),
      this.addCustomer({
        name: 'Valeria Cordero Ruiz',
        email: 'valeria.cordero@example.com',
        phone: '+506 8888-1111',
        notes: 'Eventos universitarios y juveniles'
      }),
      this.addCustomer({
        name: 'Andrés Solano Quesada',
        email: 'andres.solano@example.com',
        phone: '+506 7777-2222',
        notes: 'Eventos deportivos y celebraciones'
      }),
      this.addCustomer({
        name: 'Isabella Rojas Montero',
        email: 'isabella.rojas@example.com',
        phone: '+506 6666-3333',
        notes: 'Fiestas temáticas y cumpleaños infantiles'
      })
    ];

    // Create events for the last 12 months (at least 1 per month)
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
        status = Math.random() > 0.3 ? 'paid' : 'delivered';
      } else if (monthsAgo > 0) {
        status = Math.random() > 0.5 ? 'delivered' : 'confirmed';
      } else {
        status = Math.random() > 0.7 ? 'confirmed' : 'prospect';
      }

      const cost = Math.floor(Math.random() * 800000) + 150000; // Between 150k and 950k
      
      const event = this.addEvent({
        customerId: randomCustomer.id,
        title: randomEventType,
        date: eventDate,
        venue: randomVenue,
        cost: cost,
        taxPercentage: taxPercentage,
        status: status
      });

      events.push(event);

      // Add some additional events for variety (2-3 events per month for some months)
      if (Math.random() > 0.4) {
        const additionalEventDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthsAgo, Math.floor(Math.random() * 28) + 1);
        const anotherCustomer = customers[Math.floor(Math.random() * customers.length)];
        const anotherEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const anotherVenue = venues[Math.floor(Math.random() * venues.length)];
        
        let additionalStatus: EventStatus;
        if (monthsAgo > 2) {
          additionalStatus = Math.random() > 0.2 ? 'paid' : 'delivered';
        } else if (monthsAgo > 0) {
          additionalStatus = Math.random() > 0.4 ? 'delivered' : 'confirmed';
        } else {
          additionalStatus = Math.random() > 0.6 ? 'confirmed' : 'prospect';
        }

        const additionalCost = Math.floor(Math.random() * 600000) + 200000;
        
        const additionalEvent = this.addEvent({
          customerId: anotherCustomer.id,
          title: anotherEventType,
          date: additionalEventDate,
          venue: anotherVenue,
          cost: additionalCost,
          taxPercentage: taxPercentage,
          status: additionalStatus
        });

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
        this.addEventDetail({
          eventId: event.id,
          description: equipment,
          quantity: Math.floor(Math.random() * 4) + 1,
          notes: i === 0 ? 'Equipo principal del evento' : 'Equipo adicional'
        });
      }
    });

    // Add payments for delivered and paid events
    const paidEvents = events.filter(e => e.status === 'paid' || e.status === 'delivered');
    paidEvents.forEach(event => {
      if (Math.random() > 0.3) { // 70% of events have payments
        const paymentMethods: PaymentMethod[] = ['cash', 'transfer', 'card'];
        const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        // For paid events, add full payment
        if (event.status === 'paid') {
          this.addPayment({
            eventId: event.id,
            amount: event.totalWithTax || event.cost,
            currency: 'CRC',
            paymentDate: new Date(event.date.getTime() + (Math.random() * 7 * 24 * 60 * 60 * 1000)), // Within a week after event
            method: randomMethod,
            notes: 'Pago completo del evento'
          });
        } else {
          // For delivered events, add partial payment
          const partialAmount = Math.floor((event.totalWithTax || event.cost) * (0.3 + Math.random() * 0.4)); // 30-70% of total
          this.addPayment({
            eventId: event.id,
            amount: partialAmount,
            currency: 'CRC',
            paymentDate: new Date(event.date.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000)), // Up to 30 days before event
            method: randomMethod,
            notes: 'Pago parcial - anticipo'
          });
        }
      }
    });

    console.log(`✅ Demo data initialized: ${customers.length} customers, ${events.length} events`);
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

  addEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'taxAmount' | 'totalWithTax'>): Event {
    const now = new Date();
    
    // Get default tax from localStorage if not provided
    if (!eventData.taxPercentage) {
      const defaultTaxPercentage = localStorage.getItem('defaultTaxPercentage');
      eventData.taxPercentage = defaultTaxPercentage ? parseFloat(defaultTaxPercentage) : 13;
    }
    
    let newEvent: Event = {
      id: generateId(),
      ...eventData,
      createdAt: now,
      updatedAt: now
    };
    
    // Calculate totals with tax
    newEvent = this.calculateEventTotals(newEvent);
    
    this.events.push(newEvent);
    toast.success('Evento creado exitosamente');
    return newEvent;
  }

  updateEvent(id: string, eventData: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'taxAmount' | 'totalWithTax'>>): Event | undefined {
    const eventIndex = this.events.findIndex(event => event.id === id);
    
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

  // Add tax to event
  addTaxToEvent(eventId: string, taxPercentage: number): Event | undefined {
    return this.updateEvent(eventId, { taxPercentage });
  }

  // Remove tax from event
  removeTaxFromEvent(eventId: string): Event | undefined {
    return this.updateEvent(eventId, { taxPercentage: 0 });
  }

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
      currency: paymentData.currency || 'CRC', // Default to Costa Rican Colones
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

  // FINANCIAL SUMMARY METHODS
  getEventsTotalByStatus(status: EventStatus): number {
    return this.events
      .filter(event => event.status === status)
      .reduce((total, event) => total + (event.totalWithTax || event.cost || 0), 0);
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
      .reduce((total, event) => total + (event.totalWithTax || event.cost || 0), 0);
  }
}

// Create a singleton instance
const dataService = new DataService();
export default dataService;
