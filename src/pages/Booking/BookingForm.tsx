
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import dataService from '@/services/DataService';

const bookingSchema = z.object({
  customerName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  customerEmail: z.string().email({ message: 'Debe ser un email válido' }),
  customerPhone: z.string().min(8, { message: 'El teléfono debe tener al menos 8 caracteres' }),
  eventTitle: z.string().min(2, { message: 'El título debe tener al menos 2 caracteres' }),
  eventDate: z.date({ required_error: "Por favor selecciona una fecha" }),
  eventVenue: z.string().min(2, { message: 'El lugar debe tener al menos 2 caracteres' }),
  eventCategory: z.enum(['wedding', 'birthday', 'corporate', 'club', 'other'], { 
    required_error: "Por favor selecciona una categoría" 
  }),
  eventDescription: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const BookingForm = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      eventTitle: '',
      eventDate: new Date(),
      eventVenue: '',
      eventCategory: 'other',
      eventDescription: '',
    },
  });

  useEffect(() => {
    if (userId) {
      // Load user profile and logo for this booking form
      const profileKey = `userProfile_${userId}`;
      const logoKey = `appLogo_${userId}`;
      
      const savedProfile = localStorage.getItem(profileKey);
      const savedLogo = localStorage.getItem(logoKey);
      
      if (savedProfile) {
        try {
          setUserProfile(JSON.parse(savedProfile));
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
      
      if (savedLogo) {
        setLogoUrl(savedLogo);
      }
    }
  }, [userId]);

  const getCategoryLabel = (category: string) => {
    const categoryLabels = {
      wedding: 'Boda',
      birthday: 'Cumpleaños',
      corporate: 'Corporativo',
      club: 'Club',
      other: 'Otro'
    };
    return categoryLabels[category as keyof typeof categoryLabels] || 'Otro';
  };

  const onSubmit = async (data: BookingFormValues) => {
    if (!userId) return;
    
    setIsSubmitting(true);
    try {
      // Create new customer with correct structure
      const newCustomer = {
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        notes: data.eventDescription || '',
      };

      const customer = dataService.addCustomer(newCustomer);

      // Create new event as prospect with correct structure - ensure customerId is string
      const newEvent = {
        customerId: customer.id,
        title: data.eventTitle,
        date: data.eventDate,
        venue: data.eventVenue,
        category: data.eventCategory,
        cost: 0,
        status: 'prospect' as const,
        comments: data.eventDescription || '',
      };

      dataService.addEvent(newEvent);

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mb-4">
                {logoUrl && (
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="h-16 w-auto max-w-[200px] mx-auto mb-4"
                  />
                )}
                <h1 className="text-2xl font-bold text-green-600 mb-2">
                  ¡Gracias por tu solicitud!
                </h1>
                <p className="text-gray-600">
                  Hemos recibido tu solicitud de cotización. Nos pondremos en contacto contigo muy pronto.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show form even if no userProfile to make it public
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="h-16 w-auto max-w-[200px] mx-auto mb-4"
              />
            )}
            <CardTitle className="text-2xl">
              Contrataciones {userProfile?.artistName || userProfile?.name || 'Formulario de Booking'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Completa el formulario para solicitar una cotización
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información del Cliente</h3>
                  
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
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
                        <FormLabel>Email</FormLabel>
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
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+506 0000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información del Evento</h3>
                  
                  <FormField
                    control={form.control}
                    name="eventTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Evento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Boda, Cumpleaños, Evento Corporativo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría del Evento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="wedding">Boda</SelectItem>
                            <SelectItem value="birthday">Cumpleaños</SelectItem>
                            <SelectItem value="corporate">Corporativo</SelectItem>
                            <SelectItem value="club">Club</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventDate"
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
                    name="eventVenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lugar del Evento</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del lugar o dirección" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción Adicional (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Cuéntanos más detalles sobre tu evento..."
                            className="min-h-[100px]"
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
                  className="w-full bg-crm-primary hover:bg-crm-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Solicitar Cotización'}
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
