import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCrm } from '@/contexts/CrmContext';
import dataService from '@/services/DataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';

// Form schema
const customerSchema = z.object({
  name: z.string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no debe exceder 100 caracteres' }),
  email: z.string()
    .email({ message: 'Dirección de correo electrónico inválida' }),
  phone: z.string()
    .min(9, { message: 'El teléfono debe tener al menos 9 caracteres' })
    .max(20, { message: 'El teléfono no debe exceder 20 caracteres' }),
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshCustomers } = useCrm();
  const isEditMode = !!id;
  
  // Initialize form
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
    },
  });
  
  // Load customer data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const customer = dataService.getCustomerById(id);
      if (customer) {
        form.reset({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          notes: customer.notes,
        });
      } else {
        // Customer not found, redirect to list
        navigate('/customers');
      }
    }
  }, [id, isEditMode, navigate]);
  
  // Form submission handler
  const onSubmit = (data: CustomerFormValues) => {
    if (isEditMode) {
      dataService.updateCustomer(id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        notes: data.notes || '',
      });
    } else {
      dataService.addCustomer({
        name: data.name,
        email: data.email,
        phone: data.phone,
        notes: data.notes || '',
      });
    }
    
    refreshCustomers();
    navigate('/customers');
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="correo@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+34 612 345 678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Información adicional sobre el cliente..." 
                      rows={5}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/customers')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-crm-primary hover:bg-crm-primary/90"
              >
                {isEditMode ? 'Actualizar' : 'Crear'} Cliente
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CustomerForm;
