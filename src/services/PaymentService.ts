
import { Payment } from '../types/models';
import storageService from './StorageService';

class PaymentService {
  private readonly STORAGE_KEY = 'payments';

  getAllPayments(): Payment[] {
    const payments = storageService.getItem(this.STORAGE_KEY);
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
    storageService.setItem(this.STORAGE_KEY, JSON.stringify(payments));
    return newPayment;
  }

  updatePayment(id: string, updates: Partial<Payment>): Payment | null {
    const payments = this.getAllPayments();
    const index = payments.findIndex(p => p.id === id);
    if (index !== -1) {
      payments[index] = { ...payments[index], ...updates, updatedAt: new Date() };
      storageService.setItem(this.STORAGE_KEY, JSON.stringify(payments));
      return payments[index];
    }
    return null;
  }

  deletePayment(id: string): boolean {
    const payments = this.getAllPayments();
    const filteredPayments = payments.filter(p => p.id !== id);
    storageService.setItem(this.STORAGE_KEY, JSON.stringify(filteredPayments));
    return filteredPayments.length !== payments.length;
  }

  getPaymentById(id: string): Payment | null {
    return this.getAllPayments().find(p => p.id === id) || null;
  }

  getPaymentsByEventId(eventId: string): Payment[] {
    return this.getAllPayments().filter(p => p.eventId === eventId);
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

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

  createUserProfile(userId: string): void {
    if (!storageService.getItem(this.STORAGE_KEY)) {
      const demoPayments: Payment[] = [
        { 
          id: 'demo-payment-1', 
          eventId: 'demo-event-1', 
          amount: 1695, 
          currency: 'USD', 
          paymentDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), 
          method: 'transfer', 
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
        { 
          id: 'demo-payment-2', 
          eventId: 'demo-event-2', 
          amount: 1250, 
          currency: 'USD', 
          paymentDate: new Date(), 
          method: 'credit', 
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
      ];
      storageService.setItem(this.STORAGE_KEY, JSON.stringify(demoPayments));
    }
  }
}

export default new PaymentService();
