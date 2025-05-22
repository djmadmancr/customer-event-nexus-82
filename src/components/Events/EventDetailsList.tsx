
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { EventDetail } from '@/types/models';
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import dataService from '@/services/DataService';
import EventDetailForm from './EventDetailForm';

interface EventDetailsListProps {
  eventId: string;
}

const EventDetailsList: React.FC<EventDetailsListProps> = ({ eventId }) => {
  const [details, setDetails] = useState<EventDetail[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  
  const loadDetails = () => {
    const eventDetails = dataService.getEventDetailsByEventId(eventId);
    setDetails(eventDetails);
  };

  useEffect(() => {
    loadDetails();
  }, [eventId]);

  const handleDeleteDetail = (detailId: string) => {
    dataService.deleteEventDetail(detailId);
    loadDetails();
  };

  const handleEditDetail = (detailId: string) => {
    setSelectedDetailId(detailId);
    setIsEditOpen(true);
  };

  const handleFormComplete = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setSelectedDetailId(null);
    loadDetails();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Equipo y Detalles</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-crm-primary hover:bg-crm-primary/90"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Detalle</DialogTitle>
            </DialogHeader>
            <EventDetailForm eventId={eventId} onComplete={handleFormComplete} />
          </DialogContent>
        </Dialog>
      </div>

      {details.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay detalles registrados para este evento
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-20 text-right">Cantidad</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.map((detail) => (
                <TableRow key={detail.id}>
                  <TableCell className="font-medium">{detail.description}</TableCell>
                  <TableCell className="text-right">{detail.quantity}</TableCell>
                  <TableCell className="text-sm text-gray-500 truncate max-w-xs">
                    {detail.notes || '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditDetail(detail.id)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteDetail(detail.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Detalle</DialogTitle>
          </DialogHeader>
          {selectedDetailId && (
            <EventDetailForm 
              eventId={eventId} 
              detailId={selectedDetailId}
              onComplete={handleFormComplete} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetailsList;
