
// Customer Model
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  userId: string; // New field to associate customer with user
  createdAt: Date;
  updatedAt: Date;
}

// Event Status enum - 'paid' will be calculated automatically based on payments
export type EventStatus = 'prospect' | 'confirmed' | 'delivered' | 'paid';

// Selectable Event Status (user can only choose these manually) - removed 'paid'
export type SelectableEventStatus = 'prospect' | 'confirmed' | 'delivered';

// Event Model
export interface Event {
  id: string;
  customerId: string;
  title: string;
  date: Date;
  venue: string;
  cost: number;
  taxPercentage?: number; // New field for tax percentage
  taxAmount?: number; // Calculated tax amount
  totalWithTax?: number; // Total cost including tax
  status: EventStatus;
  comments?: string;
  userId: string; // New field to associate event with user
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

// Payment Method enum - fixed to use credit instead of credit_card
export type PaymentMethod = 'cash' | 'credit' | 'transfer' | 'check';

// Currency enum - Added MXN and COP that are used in the app
export type Currency = 'USD' | 'CRC' | 'EUR' | 'MXN' | 'COP';

// Payment Model
export interface Payment {
  id: string;
  eventId: string;
  amount: number;
  currency: Currency;
  paymentDate: Date;
  method: PaymentMethod;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User roles
export type UserRole = 'admin' | 'user';

// User Model
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
}

// User Profile Model - for personal data
export interface UserProfile {
  id: string;
  name: string;
  artistName?: string;
  email: string;
  phone: string;
  logoUrl?: string;
  defaultCurrency?: Currency;
  updatedAt: Date;
}

// Notification Model
export interface Notification {
  id: string;
  type: 'event_reminder' | 'payment_due' | 'general';
  title: string;
  message: string;
  targetId?: string; // ID of related event, customer, etc.
  targetType?: 'event' | 'customer';
  isRead: boolean;
  createdAt: Date;
}
