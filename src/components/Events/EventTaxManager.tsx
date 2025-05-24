
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Percent } from 'lucide-react';
import { Event } from '@/types/models';
import dataService from '@/services/DataService';

interface EventTaxManagerProps {
  event: Event;
  onTaxUpdate: (updatedEvent: Event) => void;
}

const EventTaxManager: React.FC<EventTaxManagerProps> = ({ event, onTaxUpdate }) => {
  const [isAddingTax, setIsAddingTax] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState('');

  const handleAddTax = () => {
    const percentage = parseFloat(taxPercentage);
    if (isNaN(percentage) || percentage <= 0) {
      return;
    }

    const updatedEvent = dataService.addTaxToEvent(event.id, percentage);
    if (updatedEvent) {
      onTaxUpdate(updatedEvent);
      setIsAddingTax(false);
      setTaxPercentage('');
    }
  };

  const handleRemoveTax = () => {
    const updatedEvent = dataService.removeTaxFromEvent(event.id);
    if (updatedEvent) {
      onTaxUpdate(updatedEvent);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {event.taxPercentage ? (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Percent className="h-3 w-3" />
            Impuesto: {event.taxPercentage}%
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveTax}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingTax(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Agregar Impuesto
        </Button>
      )}

      <Dialog open={isAddingTax} onOpenChange={setIsAddingTax}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Impuesto al Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Porcentaje de Impuesto</label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(e.target.value)}
                  placeholder="Ej: 13"
                  className="pr-8"
                />
                <Percent className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ingrese el porcentaje de impuesto a aplicar al costo base del evento
              </p>
            </div>
            
            {taxPercentage && !isNaN(parseFloat(taxPercentage)) && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm">
                  <strong>Costo base:</strong> {dataService.formatCurrency(event.cost)}
                </p>
                <p className="text-sm">
                  <strong>Impuesto ({taxPercentage}%):</strong> {dataService.formatCurrency((event.cost * parseFloat(taxPercentage)) / 100)}
                </p>
                <p className="text-sm font-semibold">
                  <strong>Total:</strong> {dataService.formatCurrency(event.cost + (event.cost * parseFloat(taxPercentage)) / 100)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTax(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddTax}
              disabled={!taxPercentage || isNaN(parseFloat(taxPercentage)) || parseFloat(taxPercentage) <= 0}
            >
              Agregar Impuesto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventTaxManager;
