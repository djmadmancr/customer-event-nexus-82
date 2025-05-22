
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCrm } from '@/contexts/CrmContext';
import dataService from '@/services/DataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventStatus } from '@/types/models';

// Form schema
const eventSchema = z.object({
  customerId: z.string({
    required_error: "Por favor selecciona un cliente",
  }),
  title: z.string()
    .min(2, { message: 'El título debe tener al menos 2 caracteres' })
    .max(100, { message: 'El título no debe exceder 100 caracteres' }),
  date: z.date({
    required_error: "Por favor selecciona una fecha para el evento",
  }),
  status: z.enum(['pending', 'confirmed', 'paid', 'completed'], {
    required_error: "Por favor selecciona un estado",
  }),
});

type EventFormValues = z.infer<typeof eventSchema>;

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { customers, refreshEvents } = useCrm();
  const isEditMode = !!id;
  
  // Get customerId from query params if present
  const queryParams = new URLSearchParams(location.search);
  const preselectedCustomerId = queryParams.get('customerId');
  
  // Initialize form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      customerId: preselectedCustomerId || '',
      title: '',
      date: new Date(),
      status: 'pending' as EventStatus,
    },
  });
  
  // Load event data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const event = dataService.getEventById(id);
      if (event) {
        form.reset({
          customerId: event.customerId,
          title: event.title,
          date: new Date(event.date),
          status: event.status,
        });
      } else {
        // Event not found, redirect to list
        navigate('/events');
      }
    }
  }, [id, isEditMode, navigate]);
  
  // Form submission handler
  const onSubmit = (data: EventFormValues) => {
    if (isEditMode) {
      dataService.updateEvent(id, data);
    } else {
      dataService.addEvent(data);
    }
    
    refreshEvents();
    
    // If we came with a preselected customer, go back to that customer's page
    if (preselectedCustomerId) {
      navigate(`/customers/${preselectedCustomerId}`);
    } else {
      navigate('/events');
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select 
                      disabled={!!preselectedCustomerId}
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="paid">Pagado</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
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
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título del evento" {...field} />
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
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
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
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (preselectedCustomerId) {
                    navigate(`/customers/${preselectedCustomerId}`);
                  } else {
                    navigate('/events');
                  }
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-crm-primary hover:bg-crm-primary/90"
              >
                {isEditMode ? 'Actualizar' : 'Crear'} Evento
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EventForm;
