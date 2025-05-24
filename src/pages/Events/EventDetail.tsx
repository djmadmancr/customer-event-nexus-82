
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Pencil, Plus, ArrowLeft, User, Calendar, CreditCard, MapPin, DollarSign } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import dataService from '@/services/DataService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PaymentList from '../Payments/PaymentList';
import PaymentForm from '../Payments/PaymentForm';
import EventDetailsList from '@/components/Events/EventDetailsList';
import EventPdfExporter from '@/components/Events/EventPdfExporter';
import EventComments from '@/components/Events/EventComments';
import { Event as CrmEvent } from '@/types/models';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, selectedEvent, setSelectedEvent } = useCrm();
  const [activeTab, setActiveTab] = useState('info');
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [eventDetails, setEventDetails] = useState([]);
  const [payments, setPayments] = useState([]);
  
  // Function to refresh all data
  const refreshEventData = () => {
    if (id) {
      const event = dataService.getEventById(id);
      if (event) {
        setSelectedEvent(event);
        // Load event details
        const details = dataService.getEventDetailsByEventId(id);
        setEventDetails(details);
        // Load payments
        const eventPayments = dataService.getPaymentsByEventId(id);
        setPayments(eventPayments);
      }
    }
  };
  
  useEffect(() => {
    if (id) {
      const event = dataService.getEventById(id);
      if (event) {
        setSelectedEvent(event);
        // Load event details
        const details = dataService.getEventDetailsByEventId(id);
        setEventDetails(details);
        // Load payments
        const eventPayments = dataService.getPaymentsByEventId(id);
        setPayments(eventPayments);
      } else {
        // Event not found, redirect to list
        navigate('/events');
      }
    }
    
    return () => {
      // Clear selected event on unmount
      setSelectedEvent(null);
    };
  }, [id, navigate, setSelectedEvent]);

  // Refresh data when tab changes to ensure latest info
  useEffect(() => {
    refreshEventData();
  }, [activeTab]);
  
  if (!selectedEvent) {
    return null;
  }
  
  const customer = customers.find(c => c.id === selectedEvent.customerId);
  
  // Calculate payment totals
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = selectedEvent.cost - totalPaid;
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'prospect':
        return <Badge className="bg-crm-pending text-gray-800">Prospecto</Badge>;
      case 'confirmed':
        return <Badge className="bg-crm-confirmed text-gray-800">Confirmado</Badge>;
      case 'delivered':
        return <Badge className="bg-amber-200 text-amber-800">Servicio Brindado</Badge>;
      case 'paid':
        return <Badge className="bg-crm-paid text-gray-800">Pagado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleEventUpdate = (updatedEvent: CrmEvent) => {
    setSelectedEvent(updatedEvent);
    // Refresh all data when event is updated
    refreshEventData();
  };

  const handlePaymentComplete = () => {
    setIsAddingPayment(false);
    // Refresh all event data to get updated status and payments
    refreshEventData();
  };

  const handleDetailsUpdate = () => {
    // Refresh event details when they are updated
    refreshEventData();
  };
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{selectedEvent.title}</h1>
        <div className="ml-auto">
          {getStatusBadge(selectedEvent.status)}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-end gap-4">
        {customer && (
          <EventPdfExporter 
            event={selectedEvent} 
            customer={customer}
            payments={payments}
            eventDetails={eventDetails}
          />
        )}
        <Button 
          variant="outline"
          onClick={() => navigate(`/events/${selectedEvent.id}/edit`)}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Editar Evento
        </Button>
        <Button 
          className="bg-crm-primary hover:bg-crm-primary/90"
          onClick={() => setIsAddingPayment(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Pago
        </Button>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-[500px]">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="comments">Comentarios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
                    <p className="mt-1 font-medium">{customer?.name || 'Cliente desconocido'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fecha</h3>
                    <p className="mt-1">
                      {format(selectedEvent.date, "PPP", { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Lugar</h3>
                    <p className="mt-1">{selectedEvent.venue}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Costo</h3>
                    <p className="mt-1">${selectedEvent.cost?.toLocaleString('es-MX') || '0'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                    <div className="mt-1">{getStatusBadge(selectedEvent.status)}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Creado el</h3>
                  <p className="mt-1">
                    {format(selectedEvent.createdAt, "PPP", { locale: es })}
                  </p>
                </div>
              </div>

              {/* Payment Summary */}
              {payments.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Resumen de Pagos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Total del Evento</p>
                      <p className="text-lg font-bold">${selectedEvent.cost?.toLocaleString('es-MX')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pagado</p>
                      <p className="text-lg font-bold text-green-600">${totalPaid.toLocaleString('es-MX')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pendiente</p>
                      <p className="text-lg font-bold text-amber-600">${pendingAmount.toLocaleString('es-MX')}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {customer && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                  <p className="mt-1">{customer.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">{customer.email}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                  <p className="mt-1">{customer.phone}</p>
                </div>
                
                <div>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    Ver perfil completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <EventDetailsList eventId={selectedEvent.id} onUpdate={handleDetailsUpdate} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pagos del evento</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentList eventId={selectedEvent.id} />
              
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={() => setIsAddingPayment(true)}
                  className="bg-crm-primary hover:bg-crm-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Pago
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <EventComments event={selectedEvent} onCommentUpdated={handleEventUpdate} />
        </TabsContent>
      </Tabs>
      
      {/* Add Payment Dialog */}
      <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Pago</DialogTitle>
          </DialogHeader>
          <PaymentForm eventId={selectedEvent.id} onComplete={handlePaymentComplete} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingPayment(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetail;
