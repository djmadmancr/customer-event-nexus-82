
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCrm } from '@/contexts/CrmContext';
import { Search, Plus, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import dataService from '@/services/DataService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import FinancialSummary from '@/components/Events/FinancialSummary';
import { useAppConfig } from '@/contexts/AppConfigContext';
import EventCalendar from '@/components/Events/EventCalendar';
import { useIsMobile } from '@/hooks/use-mobile';

interface EventListProps {
  filterByCustomerId?: string;
  showAddButton?: boolean;
}

const EventList: React.FC<EventListProps> = ({ 
  filterByCustomerId,
  showAddButton = true
}) => {
  const navigate = useNavigate();
  const { customers, events, refreshEvents, setSelectedEvent } = useCrm();
  const { defaultCurrency } = useAppConfig();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  
  // Format number without currency symbol
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  // Filter events based on search query, status filter and customerId filter
  const filteredEvents = events
    .filter(event => 
      filterByCustomerId ? event.customerId === filterByCustomerId : true
    )
    .filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(event => 
      statusFilter === 'all' ? true : event.status === statusFilter
    );
  
  // Get status badge color and text
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'prospect':
        return <Badge className="bg-purple-200 text-purple-800">Prospecto</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-200 text-blue-800">Confirmado</Badge>;
      case 'show_completed':
        return <Badge className="bg-indigo-200 text-indigo-800">Show Realizado</Badge>;
      case 'paid':
        return <Badge className="bg-purple-300 text-purple-900">Pagado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleViewEvent = (eventId: string) => {
    console.log('Navigating to event:', eventId);
    const event = dataService.getEventById(eventId);
    if (event) {
      console.log('Event found:', event);
      setSelectedEvent(event);
      navigate(`/events/${eventId}`);
    } else {
      console.error('Event not found:', eventId);
    }
  };
  
  const handleEditEvent = (eventId: string) => {
    navigate(`/events/${eventId}/edit`);
  };
  
  const handleDeleteEvent = () => {
    if (eventToDelete) {
      dataService.deleteEvent(eventToDelete);
      refreshEvents();
      setEventToDelete(null);
    }
  };
  
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Cliente desconocido';
  };
  
  return (
    <div className="space-y-6">
      {!filterByCustomerId && <FinancialSummary />}
      
      {/* Header with search, filter and add button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar eventos..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="prospect">Prospecto</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="show_completed">Show Realizado</SelectItem>
              <SelectItem value="paid">Pagado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {showAddButton && (
          <Button 
            className="bg-crm-primary hover:bg-crm-primary/90"
            onClick={() => navigate('/events/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        )}
      </div>
      
      {/* Calendar View - Full Width */}
      <div className="w-full">
        <EventCalendar 
          events={filteredEvents}
          customers={customers}
          onEventClick={handleViewEvent}
          onEventEdit={handleEditEvent}
          onEventDelete={setEventToDelete}
        />
      </div>
      
      {/* Events List - Full Width at Bottom */}
      <div className="w-full">
        <div className="bg-white rounded-md shadow-sm border overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">
              Lista de Eventos
            </h3>
          </div>
          
          {filteredEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Lugar</TableHead>
                    <TableHead className="text-right">Monto ({defaultCurrency})</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => {
                    const eventTotal = event.totalWithTax || event.cost;
                    return (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          {event.title}
                        </TableCell>
                        <TableCell>
                          {getCustomerName(event.customerId)}
                        </TableCell>
                        <TableCell>
                          {format(event.date, "dd/MM/yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>
                          {event.venue}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatNumber(eventTotal)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(event.status)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewEvent(event.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditEvent(event.id)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => setEventToDelete(event.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">
                No se encontraron eventos
              </p>
              {showAddButton && (
                <Button 
                  variant="outline"
                  onClick={() => navigate('/events/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear evento
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventToDelete(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEvent}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventList;
