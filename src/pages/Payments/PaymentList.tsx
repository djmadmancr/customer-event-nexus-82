
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Payment } from '@/types/models';
import dataService from '@/services/DataService';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppConfig } from '@/contexts/AppConfigContext';

interface PaymentListProps {
  eventId: string;
}

const PaymentList: React.FC<PaymentListProps> = ({ eventId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const { defaultCurrency } = useAppConfig();
  
  // Load payments for this event
  useEffect(() => {
    setPayments(dataService.getPaymentsByEventId(eventId));
  }, [eventId]);
  
  // Format payment method
  const getPaymentMethodText = (method: string) => {
    switch(method) {
      case 'cash': return 'Efectivo';
      case 'credit': return 'Tarjeta de crédito';
      case 'transfer': return 'Transferencia';
      case 'check': return 'Cheque';
      default: return method;
    }
  };
  
  // Format number without currency symbol
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const handleDeletePayment = () => {
    if (paymentToDelete) {
      dataService.deletePayment(paymentToDelete);
      setPayments(dataService.getPaymentsByEventId(eventId));
      toast.success('Pago eliminado correctamente');
      setPaymentToDelete(null);
    }
  };
  
  // Calculate total amount
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  return (
    <div>
      {payments.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Monto ({defaultCurrency})</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(payment.paymentDate, 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {getPaymentMethodText(payment.method)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setPaymentToDelete(payment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={2} className="font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatNumber(totalAmount)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500">No hay pagos registrados para este evento</p>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!paymentToDelete} onOpenChange={() => setPaymentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentToDelete(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePayment}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentList;
