
import { Customer, Event, Payment, EventDetail } from '../types/models';
import storageService from './StorageService';
import customerService from './CustomerService';
import eventService from './EventService';
import paymentService from './PaymentService';

class DataService {
  setCurrentUserId(userId: string) {
    storageService.setCurrentUserId(userId);
  }

  createUserProfile(userId: string): void {
    customerService.createUserProfile(userId);
    eventService.createUserProfile(userId);
    paymentService.createUserProfile(userId);
    
    if (!storageService.getItem('eventDetails')) {
      storageService.setItem('eventDetails', JSON.stringify([]));
    }
  }

  // Customer methods - delegated to CustomerService
  getAllCustomers = customerService.getAllCustomers.bind(customerService);
  addCustomer = customerService.addCustomer.bind(customerService);
  updateCustomer = customerService.updateCustomer.bind(customerService);
  deleteCustomer = customerService.deleteCustomer.bind(customerService);
  getCustomerById = customerService.getCustomerById.bind(customerService);

  // Event methods - delegated to EventService
  getAllEvents = eventService.getAllEvents.bind(eventService);
  addEvent = eventService.addEvent.bind(eventService);
  updateEvent = eventService.updateEvent.bind(eventService);
  deleteEvent = eventService.deleteEvent.bind(eventService);
  getEventById = eventService.getEventById.bind(eventService);
  getEventsByCustomerId = eventService.getEventsByCustomerId.bind(eventService);
  addTaxToEvent = eventService.addTaxToEvent.bind(eventService);
  removeTaxFromEvent = eventService.removeTaxFromEvent.bind(eventService);

  // Payment methods - delegated to PaymentService
  getAllPayments = paymentService.getAllPayments.bind(paymentService);
  addPayment = paymentService.addPayment.bind(paymentService);
  updatePayment = paymentService.updatePayment.bind(paymentService);
  deletePayment = paymentService.deletePayment.bind(paymentService);
  getPaymentById = paymentService.getPaymentById.bind(paymentService);
  getPaymentsByEventId = paymentService.getPaymentsByEventId.bind(paymentService);
  formatCurrency = paymentService.formatCurrency.bind(paymentService);
  getCurrencySymbol = paymentService.getCurrencySymbol.bind(paymentService);

  // Event Details methods
  getAllEventDetails(): EventDetail[] {
    const details = storageService.getItem('eventDetails');
    return details ? JSON.parse(details).map((detail: any) => ({
      ...detail,
      createdAt: new Date(detail.createdAt),
      updatedAt: new Date(detail.updatedAt),
    })) : [];
  }

  getEventDetailsByEventId(eventId: string): EventDetail[] {
    return this.getAllEventDetails().filter(d => d.eventId === eventId);
  }

  getEventDetailById(id: string): EventDetail | null {
    return this.getAllEventDetails().find(d => d.id === id) || null;
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
    storageService.setItem('eventDetails', JSON.stringify(details));
    return newDetail;
  }

  updateEventDetail(id: string, updates: Partial<EventDetail>): EventDetail | null {
    const details = this.getAllEventDetails();
    const index = details.findIndex(d => d.id === id);
    if (index !== -1) {
      details[index] = { ...details[index], ...updates, updatedAt: new Date() };
      storageService.setItem('eventDetails', JSON.stringify(details));
      return details[index];
    }
    return null;
  }

  deleteEventDetail(id: string): boolean {
    const details = this.getAllEventDetails();
    const filteredDetails = details.filter(d => d.id !== id);
    storageService.setItem('eventDetails', JSON.stringify(filteredDetails));
    return filteredDetails.length !== details.length;
  }

  // Financial analysis
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
}

export default new DataService();
