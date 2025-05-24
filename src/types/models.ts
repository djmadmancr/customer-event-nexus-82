
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

// Currency enum
export type Currency = 'USD' | 'CRC' | 'EUR';

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

// App Settings Model (simplified)
export interface AppSettings {
  id: string;
  logoUrl?: string;
  updatedAt: Date;
  updatedBy: string;
}
