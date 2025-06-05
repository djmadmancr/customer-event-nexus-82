
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useCrm } from '@/contexts/CrmContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import dataService from '@/services/DataService';
import NoCustomerDialog from '@/components/Events/NoCustomerDialog';

const eventSchema = z.object({
  customerId: z.string().min(1, { message: 'Debes seleccionar un cliente' }),
  title: z.string().min(2, { message: 'El título debe tener al menos 2 caracteres' }),
  date: z.date({ required_error: "Por favor selecciona una fecha" }),
  venue: z.string().min(2, { message: 'El lugar debe tener al menos 2 caracteres' }),
  cost: z.coerce.number().min(0, { message: 'El costo debe ser mayor o igual a 0' }),
  status: z.enum(['prospect', 'confirmed', 'delivered', 'paid']),
  comments: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { customers, refreshEvents } = useCrm();
  const { defaultCurrency } = useAppConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNoCustomerDialog, setShowNoCustomerDialog] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      customerId: '',
      title: '',
      date: new Date(),
      venue: '',
      cost: 0,
      status: 'prospect',
      comments: '',
    },
  });

  useEffect(() => {
    // Check if there are no customers when trying to create a new event
    if (!id && customers.length === 0) {
      setShowNoCustomerDialog(true);
      return;
    }

    if (id) {
      const event = dataService.getEventById(id);
      if (event) {
        form.reset({
          customerId: event.customerId,
          title: event.title,
          date: event.date,
          venue: event.venue,
          cost: event.cost,
          status: event.status,
          comments: event.comments || '',
        });
      }
    } else {
      const customerId = searchParams.get('customerId');
      if (customerId) {
        form.setValue('customerId', customerId);
      }
    }
  }, [id, form, searchParams, customers.length]);

  const onSubmit = (data: EventFormValues) => {
    setIsSubmitting(true);

    try {
      if (id) {
        dataService.updateEvent(id, data);
      } else {
        // Ensure all required fields are present for new events
        const eventData = {
          customerId: data.customerId,
          title: data.title,
          date: data.date,
          venue: data.venue,
          cost: data.cost,
          status: data.status,
          comments: data.comments || '',
        };
        dataService.addEvent(eventData);
      }
      
      refreshEvents();
      navigate('/events');
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCustomer = () => {
    setShowNoCustomerDialog(false);
    navigate('/customers/new');
  };

  const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    CRC: '₡',
    MXN: '$',
    COP: '$',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {id ? 'Editar Evento' : 'Nuevo Evento'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Editar Evento' : 'Crear Nuevo Evento'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del Evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Boda de Juan y María" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha del Evento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={es}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lugar del Evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Hotel Real Intercontinental" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto ({defaultCurrency})</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        step="0.01"
                        placeholder="0.00"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="prospect">Prospecto</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="delivered">Entregado</SelectItem>
                        <SelectItem value="paid">Pagado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comentarios</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Comentarios adicionales sobre el evento..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => navigate('/events')}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-crm-primary hover:bg-crm-primary/90"
                >
                  {id ? 'Actualizar' : 'Crear'} Evento
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <NoCustomerDialog
        open={showNoCustomerDialog}
        onOpenChange={setShowNoCustomerDialog}
        onCreateCustomer={handleCreateCustomer}
      />
    </div>
  );
};

export default EventForm;
