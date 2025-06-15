
import { Event } from '../types/models';
import storageService from './StorageService';

class EventService {
  private readonly STORAGE_KEY = 'events';

  getAllEvents(): Event[] {
    const events = storageService.getItem(this.STORAGE_KEY);
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
    storageService.setItem(this.STORAGE_KEY, JSON.stringify(events));
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<Event>): Event | null {
    const events = this.getAllEvents();
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...updates, updatedAt: new Date() };
      storageService.setItem(this.STORAGE_KEY, JSON.stringify(events));
      return events[index];
    }
    return null;
  }

  deleteEvent(id: string): boolean {
    const events = this.getAllEvents();
    const filteredEvents = events.filter(e => e.id !== id);
    storageService.setItem(this.STORAGE_KEY, JSON.stringify(filteredEvents));
    return filteredEvents.length !== events.length;
  }

  getEventById(id: string): Event | null {
    return this.getAllEvents().find(e => e.id === id) || null;
  }

  getEventsByCustomerId(customerId: string): Event[] {
    return this.getAllEvents().filter(e => e.customerId === customerId);
  }

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
    return 'demo-user';
  }

  createUserProfile(userId: string): void {
    if (!storageService.getItem(this.STORAGE_KEY) || JSON.parse(storageService.getItem(this.STORAGE_KEY)!).length === 0) {
      const demoEvents: Event[] = [
        { 
          id: 'demo-event-1', 
          customerId: 'demo-customer-1', 
          title: 'Lanzamiento Producto X', 
          date: new Date(new Date().setMonth(new Date().getMonth() - 1)), 
          venue: 'Hotel Real Intercontinental', 
          cost: 1500, 
          totalWithTax: 1695, 
          taxPercentage: 13, 
          status: 'paid', 
          category: 'corporate', 
          userId, 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          comments: 'Evento de alto perfil.' 
        },
        { 
          id: 'demo-event-2', 
          customerId: 'demo-customer-2', 
          title: 'Boda Ana y Carlos', 
          date: new Date(new Date().setDate(new Date().getDate() + 30)), 
          venue: 'Reserva Conchal', 
          cost: 2500, 
          status: 'confirmed', 
          category: 'wedding', 
          userId, 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          comments: 'Requiere equipo de sonido para exteriores.' 
        },
        { 
          id: 'demo-event-3', 
          customerId: 'demo-customer-2', 
          title: 'Cumpleaños de Ana', 
          date: new Date(new Date().setDate(new Date().getDate() - 10)), 
          venue: 'Salón de eventos La Arboleda', 
          cost: 800, 
          status: 'show_completed', 
          category: 'birthday', 
          userId, 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          comments: 'Saldo pendiente.' 
        },
      ];
      storageService.setItem(this.STORAGE_KEY, JSON.stringify(demoEvents));
    }
  }
}

export default new EventService();
