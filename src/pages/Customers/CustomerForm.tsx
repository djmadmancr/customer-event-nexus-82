import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ArrowLeft } from 'lucide-react';
import dataService from '@/services/DataService';
import { Customer } from '@/types/models';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCrm } from '@/contexts/CrmContext';

const customerSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().min(8, { message: 'El teléfono debe tener al menos 8 dígitos' }),
  identificationNumber: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const CustomerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { refreshCustomers } = useCrm();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!id);

  const isEditing = !!id;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      identificationNumber: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      const customerData = dataService.getCustomerById(id);
      if (customerData) {
        setCustomer(customerData);
        form.reset({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          identificationNumber: customerData.identificationNumber || '',
          notes: customerData.notes,
        });
      }
      setLoading(false);
    }
  }, [id, isEditing, form]);

  const onSubmit = async (data: CustomerFormValues) => {
    if (!currentUser) {
      toast.error('Usuario no autenticado');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && customer) {
        dataService.updateCustomer(customer.id, data);
        toast.success('Cliente actualizado correctamente');
      } else {
        // Ensure all required fields are present
        dataService.addCustomer({
          name: data.name,
          email: data.email,
          phone: data.phone,
          identificationNumber: data.identificationNumber || '',
          notes: data.notes || '',
          userId: currentUser.uid,
        });
        toast.success('Cliente creado correctamente');
      }
      
      // Refresh customers data immediately
      refreshCustomers();
      
      navigate('/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Error al guardar el cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crm-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/customers')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a clientes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <Input type="email" placeholder="email@ejemplo.com" {...field} />
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
                      <Input placeholder="+506 0000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identificationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identificación (Cédula/ID)</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de identificación" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notas adicionales..." rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/customers')}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-crm-primary hover:bg-crm-primary/90"
                >
                  {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerForm;
