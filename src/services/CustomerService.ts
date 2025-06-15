
import { Customer } from '../types/models';
import storageService from './StorageService';

class CustomerService {
  private readonly STORAGE_KEY = 'customers';

  getAllCustomers(): Customer[] {
    const customers = storageService.getItem(this.STORAGE_KEY);
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
    storageService.setItem(this.STORAGE_KEY, JSON.stringify(customers));
    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const customers = this.getAllCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updates, updatedAt: new Date() };
      storageService.setItem(this.STORAGE_KEY, JSON.stringify(customers));
      return customers[index];
    }
    return null;
  }

  deleteCustomer(id: string): boolean {
    const customers = this.getAllCustomers();
    const filteredCustomers = customers.filter(c => c.id !== id);
    storageService.setItem(this.STORAGE_KEY, JSON.stringify(filteredCustomers));
    return filteredCustomers.length !== customers.length;
  }

  getCustomerById(id: string): Customer | null {
    return this.getAllCustomers().find(c => c.id === id) || null;
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
      const demoCustomers: Customer[] = [
        { 
          id: 'demo-customer-1', 
          name: 'Empresa Creativa S.A.', 
          email: 'contacto@creativa.com', 
          phone: '2233-4455', 
          identificationNumber: '3-101-123456', 
          notes: 'Cliente corporativo importante.', 
          userId, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
        { 
          id: 'demo-customer-2', 
          name: 'Ana Sofía Solano', 
          email: 'anasolano@email.com', 
          phone: '8877-6655', 
          identificationNumber: '1-1234-5678', 
          notes: 'Boda en la playa.', 
          userId, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
      ];
      storageService.setItem(this.STORAGE_KEY, JSON.stringify(demoCustomers));
    }
  }
}

export default new CustomerService();
