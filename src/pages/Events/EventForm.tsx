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
import { CalendarIcon, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import dataService from '@/services/DataService';
import { Event, Customer, SelectableEventStatus, EventCategory, EventDetail, Payment, PaymentMethod, Currency } from '@/types/models';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCrm } from '@/contexts/CrmContext';
import { useLanguage } from '@/contexts/LanguageContext';

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

interface EventDetailForm {
  id?: string;
  description: string;
  quantity: number;
  notes?: string;
}

interface PaymentForm {
  id?: string;
  amount: number;
  currency: Currency;
  paymentDate: Date;
  method: PaymentMethod;
  notes?: string;
}

const EventForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { refreshEvents, customers } = useCrm();
  const { t } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!id);

  // Form state for details and payments
  const [eventDetails, setEventDetails] = useState<EventDetailForm[]>([]);
  const [payments, setPayments] = useState<PaymentForm[]>([]);

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

        // Load existing details and payments
        const existingDetails = dataService.getEventDetailsByEventId(id);
        setEventDetails(existingDetails.map(detail => ({
          id: detail.id,
          description: detail.description,
          quantity: detail.quantity,
          notes: detail.notes
        })));

        const existingPayments = dataService.getPaymentsByEventId(id);
        setPayments(existingPayments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          paymentDate: payment.paymentDate,
          method: payment.method,
          notes: payment.notes
        })));
      }
      setLoading(false);
    }
  }, [id, isEditing, form]);

  const addEventDetail = () => {
    setEventDetails([...eventDetails, {
      description: '',
      quantity: 1,
      notes: ''
    }]);
  };

  const removeEventDetail = (index: number) => {
    setEventDetails(eventDetails.filter((_, i) => i !== index));
  };

  const updateEventDetail = (index: number, field: keyof EventDetailForm, value: any) => {
    const updatedDetails = [...eventDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setEventDetails(updatedDetails);
  };

  const addPayment = () => {
    setPayments([...payments, {
      amount: 0,
      currency: 'USD',
      paymentDate: new Date(),
      method: 'cash',
      notes: ''
    }]);
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const updatePayment = (index: number, field: keyof PaymentForm, value: any) => {
    const updatedPayments = [...payments];
    updatedPayments[index] = { ...updatedPayments[index], [field]: value };
    setPayments(updatedPayments);
  };

  const onSubmit = async (data: EventFormValues) => {
    if (!currentUser) {
      toast.error('Usuario no autenticado');
      return;
    }

    setIsSubmitting(true);

    try {
      let savedEvent: Event;

      if (isEditing && event) {
        savedEvent = dataService.updateEvent(event.id, data)!;
        toast.success(t('profile_updated'));
      } else {
        savedEvent = dataService.addEvent({
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

      // Save event details
      if (isEditing) {
        // Remove existing details that are not in the current form
        const existingDetails = dataService.getEventDetailsByEventId(savedEvent.id);
        const currentDetailIds = eventDetails.filter(d => d.id).map(d => d.id);
        existingDetails.forEach(detail => {
          if (!currentDetailIds.includes(detail.id)) {
            dataService.deleteEventDetail(detail.id);
          }
        });
      }

      eventDetails.forEach(detail => {
        if (detail.description.trim()) {
          if (detail.id) {
            dataService.updateEventDetail(detail.id, {
              description: detail.description,
              quantity: detail.quantity,
              notes: detail.notes
            });
          } else {
            dataService.addEventDetail({
              eventId: savedEvent.id,
              description: detail.description,
              quantity: detail.quantity,
              notes: detail.notes
            });
          }
        }
      });

      // Save payments
      if (isEditing) {
        // Remove existing payments that are not in the current form
        const existingPayments = dataService.getPaymentsByEventId(savedEvent.id);
        const currentPaymentIds = payments.filter(p => p.id).map(p => p.id);
        existingPayments.forEach(payment => {
          if (!currentPaymentIds.includes(payment.id)) {
            dataService.deletePayment(payment.id);
          }
        });
      }

      payments.forEach(payment => {
        if (payment.amount > 0) {
          if (payment.id) {
            dataService.updatePayment(payment.id, {
              amount: payment.amount,
              currency: payment.currency,
              paymentDate: payment.paymentDate,
              method: payment.method,
              notes: payment.notes
            });
          } else {
            dataService.addPayment({
              eventId: savedEvent.id,
              amount: payment.amount,
              currency: payment.currency,
              paymentDate: payment.paymentDate,
              method: payment.method,
              notes: payment.notes
            });
          }
        }
      });
      
      refreshEvents();
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
      case 'prospect': return t('prospect');
      case 'confirmed': return t('confirmed');
      case 'show_completed': return t('show_completed');
      default: return status;
    }
  };

  const getCategoryText = (category: EventCategory) => {
    switch(category) {
      case 'wedding': return t('wedding');
      case 'birthday': return t('birthday');
      case 'corporate': return t('corporate');
      case 'club': return t('club');
      case 'other': return t('other');
      default: return category;
    }
  };

  const getMethodText = (method: PaymentMethod) => {
    switch(method) {
      case 'cash': return t('cash');
      case 'credit': return t('credit');
      case 'transfer': return t('transfer');
      case 'check': return t('check');
      default: return method;
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/events')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('events')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? t('edit_event') : t('new_event')}
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
                    <FormLabel>{t('customers')}</FormLabel>
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
                    <FormLabel>{t('date')}</FormLabel>
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
                    <FormLabel>{t('venue')}</FormLabel>
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
                    <FormLabel>{t('category')}</FormLabel>
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
                    <FormLabel>{t('cost')}</FormLabel>
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
                    <FormLabel>{t('status')}</FormLabel>
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
                    <FormLabel>{t('comments')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Comentarios adicionales..." rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Details Section */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Equipo y Detalles</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEventDetail}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('add')}
                  </Button>
                </div>

                {eventDetails.map((detail, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-5">
                      <Input
                        placeholder="Descripción del equipo/detalle"
                        value={detail.description}
                        onChange={(e) => updateEventDetail(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Cantidad"
                        value={detail.quantity}
                        onChange={(e) => updateEventDetail(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Input
                        placeholder="Notas adicionales"
                        value={detail.notes || ''}
                        onChange={(e) => updateEventDetail(index, 'notes', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEventDetail(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payments Section */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Pagos y Adelantos</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPayment}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('add')}
                  </Button>
                </div>

                {payments.map((payment, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Monto"
                        value={payment.amount}
                        onChange={(e) => updatePayment(index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Select 
                        value={payment.currency} 
                        onValueChange={(value) => updatePayment(index, 'currency', value as Currency)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="CRC">CRC</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="MXN">MXN</SelectItem>
                          <SelectItem value="COP">COP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Select 
                        value={payment.method} 
                        onValueChange={(value) => updatePayment(index, 'method', value as PaymentMethod)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">{getMethodText('cash')}</SelectItem>
                          <SelectItem value="credit">{getMethodText('credit')}</SelectItem>
                          <SelectItem value="transfer">{getMethodText('transfer')}</SelectItem>
                          <SelectItem value="check">{getMethodText('check')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {format(payment.paymentDate, "dd/MM/yyyy")}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={payment.paymentDate}
                            onSelect={(date) => updatePayment(index, 'paymentDate', date || new Date())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        placeholder="Notas del pago"
                        value={payment.notes || ''}
                        onChange={(e) => updatePayment(index, 'notes', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePayment(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/events')}
                >
                  {t('cancel')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-crm-primary hover:bg-crm-primary/90"
                >
                  {isSubmitting ? 'Guardando...' : (isEditing ? t('edit') : 'Crear')}
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
