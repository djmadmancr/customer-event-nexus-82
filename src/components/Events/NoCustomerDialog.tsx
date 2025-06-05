
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NoCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCustomer: () => void;
}

const NoCustomerDialog: React.FC<NoCustomerDialogProps> = ({
  open,
  onOpenChange,
  onCreateCustomer,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>No hay clientes disponibles</DialogTitle>
          <DialogDescription>
            Para crear un evento necesitas tener al menos un cliente registrado.
            ¿Deseas crear un cliente primero?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onCreateCustomer}>
            Crear Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoCustomerDialog;
