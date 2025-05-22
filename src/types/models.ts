
// Customer Model
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// Event Status enum
export type EventStatus = 'prospect' | 'confirmed' | 'delivered' | 'paid';

// Event Model
export interface Event {
  id: string;
  customerId: string;
  title: string;
  date: Date;
  venue: string;
  cost: number;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Equipment/Details for events
export interface EventDetail {
  id: string;
  eventId: string;
  description: string;
  quantity: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Method enum
export type PaymentMethod = 'cash' | 'credit' | 'transfer' | 'check';

// Payment Model
export interface Payment {
  id: string;
  eventId: string;
  amount: number;
  paymentDate: Date;
  method: PaymentMethod;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
