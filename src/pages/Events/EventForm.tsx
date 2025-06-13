import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import dataService from '@/services/DataService';
import { Event, Customer, SelectableEventStatus, EventCategory } from '@/types/models';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const eventSchema = z.object({
  customerId: z.string().min(1, { message: 'Debe seleccionar un cliente' }),
  title: z.string().min(2, { message: 'El título debe tener al menos 2 caracteres' }),
  date: z.date({ required_error: 'La fecha es requerida' }),
  venue: z.string().min(2, { message: 'El lugar debe tener al menos 2 caracteres' }),
  cost: z.coerce.number().min(0, { message: 'El costo debe ser mayor o igual a 0' }),
  status: z.enum(['prospect', 'confirmed', 'show_completed']),
  category: z.enum(['wedding', 'birthday', 'corporate', 'club', 'other']),
  comments: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

const EventForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!id);

  const isEditing = !!id;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      customerId: '',
      title: '',
      venue: '',
      cost: 0,
      status: 'prospect',
      category: 'other',
      comments: '',
    },
  });

  useEffect(() => {
    // Load customers
    setCustomers(dataService.getAllCustomers());

    if (isEditing && id) {
      const eventData = dataService.getEventById(id);
      if (eventData) {
        setEvent(eventData);
        form.reset({
          customerId: eventData.customerId,
          title: eventData.title,
          date: eventData.date,
          venue: eventData.venue,
          cost: eventData.cost,
          status: eventData.status as SelectableEventStatus,
          category: eventData.category || 'other',
          comments: eventData.comments || '',
        });
      }
      setLoading(false);
    }
  }, [id, isEditing, form]);

  const onSubmit = async (data: EventFormValues) => {
    if (!currentUser) {
      toast.error('Usuario no autenticado');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && event) {
        dataService.updateEvent(event.id, data);
        toast.success('Evento actualizado correctamente');
      } else {
        // Ensure all required fields are present
        dataService.addEvent({
          customerId: data.customerId,
          title: data.title,
          date: data.date,
          venue: data.venue,
          cost: data.cost,
          status: data.status,
          category: data.category,
          comments: data.comments || '',
          userId: currentUser.uid,
        });
        toast.success('Evento creado correctamente');
      }
      
      navigate('/events');
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Error al guardar el evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusText = (status: SelectableEventStatus) => {
    switch(status) {
      case 'prospect': return 'Prospecto';
      case 'confirmed': return 'Confirmado';
      case 'show_completed': return 'Show Completado';
      default: return status;
    }
  };

  const getCategoryText = (category: EventCategory) => {
    switch(category) {
      case 'wedding': return 'Boda';
      case 'birthday': return 'Cumpleaños';
      case 'corporate': return 'Corporativo';
      case 'club': return 'Club/Discoteca';
      case 'other': return 'Otro';
      default: return category;
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
          onClick={() => navigate('/events')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a eventos
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            {customer.name} ({customer.email})
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
                    <FormLabel>Título del evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Boda de María y Juan" {...field} />
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
                    <FormLabel>Fecha del evento</FormLabel>
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
                          disabled={(date) => date < new Date()}
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
                    <FormLabel>Lugar del evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Hotel Presidente, San José" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="wedding">{getCategoryText('wedding')}</SelectItem>
                        <SelectItem value="birthday">{getCategoryText('birthday')}</SelectItem>
                        <SelectItem value="corporate">{getCategoryText('corporate')}</SelectItem>
                        <SelectItem value="club">{getCategoryText('club')}</SelectItem>
                        <SelectItem value="other">{getCategoryText('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
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
                        <SelectItem value="prospect">{getStatusText('prospect')}</SelectItem>
                        <SelectItem value="confirmed">{getStatusText('confirmed')}</SelectItem>
                        <SelectItem value="show_completed">{getStatusText('show_completed')}</SelectItem>
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
                      <Textarea placeholder="Comentarios adicionales..." rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/events')}
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

export default EventForm;
