
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cliente requerido</AlertDialogTitle>
          <AlertDialogDescription>
            Para crear un evento necesitas primero crear un cliente. ¿Deseas crear un cliente ahora?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onCreateCustomer}>
            Crear Cliente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NoCustomerDialog;
