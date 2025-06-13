
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import dataService from '@/services/DataService';
import { EventCategory } from '@/types/models';
import { toast } from 'sonner';

const bookingSchema = z.object({
  // Customer fields
  customerName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  customerEmail: z.string().email({ message: 'Email inválido' }),
  customerPhone: z.string().min(8, { message: 'El teléfono debe tener al menos 8 dígitos' }),
  customerNotes: z.string().optional(),
  
  // Event fields
  eventTitle: z.string().min(2, { message: 'El título debe tener al menos 2 caracteres' }),
  eventDate: z.date({ required_error: 'La fecha es requerida' }),
  venue: z.string().min(2, { message: 'El lugar debe tener al menos 2 caracteres' }),
  category: z.enum(['wedding', 'birthday', 'corporate', 'club', 'other']),
  cost: z.coerce.number().min(0, { message: 'El costo debe ser mayor o igual a 0' }),
  comments: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const BookingForm: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerNotes: '',
      eventTitle: '',
      venue: '',
      category: 'wedding',
      cost: 0,
      comments: '',
    },
  });

  const onSubmit = async (data: BookingFormValues) => {
    if (!userId) {
      toast.error('ID de usuario inválido');
      return;
    }

    setIsSubmitting(true);

    try {
      // Set the user context for the booking
      dataService.setCurrentUserId(userId);

      // Create customer first
      const customer = dataService.addCustomer({
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        notes: data.customerNotes || '',
        userId: userId,
      });

      // Create event as prospect
      const event = dataService.addEvent({
        customerId: customer.id,
        title: data.eventTitle,
        date: data.eventDate,
        venue: data.venue,
        category: data.category,
        cost: data.cost,
        status: 'prospect',
        comments: data.comments || '',
        userId: userId,
      });

      toast.success('Cotización enviada exitosamente');
      
      // Reset form
      form.reset();
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Error al enviar la cotización');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Solicitar Cotización</CardTitle>
            <p className="text-center text-gray-600">
              Completa el formulario para solicitar una cotización personalizada
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Información de Contacto</h3>
                  
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="tu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono *</FormLabel>
                        <FormControl>
                          <Input placeholder="+506 0000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas adicionales</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Información adicional de contacto..." rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Event Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Información del Evento</h3>
                  
                  <FormField
                    control={form.control}
                    name="eventTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del evento *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Boda de María y Juan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha del evento *</FormLabel>
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
                        <FormLabel>Lugar del evento *</FormLabel>
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
                        <FormLabel>Categoría del evento *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <FormLabel>Presupuesto estimado</FormLabel>
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
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comentarios adicionales</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe detalles específicos, requerimientos especiales, etc." 
                            rows={4} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Cotización'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingForm;
