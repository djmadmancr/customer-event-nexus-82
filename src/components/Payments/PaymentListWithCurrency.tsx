
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import dataService from '@/services/DataService';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Payment, PaymentMethod } from '@/types/models';

interface PaymentListProps {
  eventId?: string;
  filterByCustomerId?: string;
  showAddButton?: boolean;
}

const PaymentListWithCurrency: React.FC<PaymentListProps> = ({ 
  eventId, 
  filterByCustomerId, 
  showAddButton = true 
}) => {
  const { defaultCurrency } = useAppConfig();
  const { t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const loadPayments = () => {
      if (eventId) {
        const eventPayments = dataService.getPaymentsByEventId(eventId);
        setPayments(eventPayments);
      } else {
        const allPayments = dataService.getAllPayments();
        setPayments(allPayments);
      }
    };

    loadPayments();
  }, [eventId]);

  const handleDeletePayment = (paymentId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este pago?')) {
      dataService.deletePayment(paymentId);
      if (eventId) {
        const eventPayments = dataService.getPaymentsByEventId(eventId);
        setPayments(eventPayments);
      } else {
        const allPayments = dataService.getAllPayments();
        setPayments(allPayments);
      }
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'cash': return t('cash');
      case 'transfer': return t('transfer');
      case 'credit': return t('credit');
      case 'check': return t('check');
      default: return method;
    }
  };

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    const baseClasses = "text-xs";
    switch (method) {
      case 'cash':
        return <Badge className={`${baseClasses} bg-green-100 text-green-800`}>{t('cash')}</Badge>;
      case 'transfer':
        return <Badge className={`${baseClasses} bg-blue-100 text-blue-800`}>{t('transfer')}</Badge>;
      case 'credit':
        return <Badge className={`${baseClasses} bg-purple-100 text-purple-800`}>{t('credit')}</Badge>;
      case 'check':
        return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800`}>{t('check')}</Badge>;
      default:
        return <Badge variant="outline" className={baseClasses}>{method}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {payments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t('no_payments_registered')}{eventId ? ' para este evento' : ''}.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('date')}</TableHead>
              <TableHead>{t('amount')} ({defaultCurrency})</TableHead>
              <TableHead>{t('method')}</TableHead>
              <TableHead>{t('notes')}</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {format(payment.paymentDate, 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell className="font-medium">
                  {payment.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  {getPaymentMethodBadge(payment.method)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {payment.notes || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePayment(payment.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {payments.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {t('total')} de pagos: {payments.length}
          </div>
          <div className="text-lg font-semibold">
            {t('total')} ({defaultCurrency}): {payments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentListWithCurrency;
