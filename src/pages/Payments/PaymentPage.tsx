
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PaymentMethod } from '@/types/models';
import { useCrm } from '@/contexts/CrmContext';
import dataService from '@/services/DataService';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpDown, Calendar, CreditCard } from 'lucide-react';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { customers, events } = useCrm();
  const { defaultCurrency } = useAppConfig();
  const { t } = useLanguage();
  const [payments, setPayments] = useState(dataService.getAllPayments());
  const [sortType, setSortType] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Format payment method
  const getPaymentMethodText = (method: string) => {
    switch(method) {
      case 'cash': return t('cash');
      case 'credit': return t('credit');
      case 'transfer': return t('transfer');
      case 'check': return t('check');
      default: return method;
    }
  };
  
  // Get customer and event information
  const getCustomerAndEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return { customerName: 'Desconocido', eventTitle: 'Desconocido' };
    
    const customer = customers.find(c => c.id === event.customerId);
    return {
      customerName: customer?.name || 'Desconocido',
      eventTitle: event.title,
      eventId: event.id
    };
  };
  
  // Sort payments
  useEffect(() => {
    let sortedPayments = [...dataService.getAllPayments()];
    
    if (sortType === 'date') {
      sortedPayments.sort((a, b) => {
        return sortDirection === 'asc' 
          ? a.paymentDate.getTime() - b.paymentDate.getTime()
          : b.paymentDate.getTime() - a.paymentDate.getTime();
      });
    } else {
      sortedPayments.sort((a, b) => {
        return sortDirection === 'asc' 
          ? a.amount - b.amount
          : b.amount - a.amount;
      });
    }
    
    setPayments(sortedPayments);
  }, [sortType, sortDirection]);
  
  // Toggle sort direction
  const toggleSort = (type: 'date' | 'amount') => {
    if (sortType === type) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortType(type);
      setSortDirection('desc');
    }
  };
  
  // Calculate total amount
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_payments')}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataService.formatCurrency(totalAmount, defaultCurrency)}</div>
            <p className="text-xs text-muted-foreground">
              {payments.length} {t('payments_registered')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('last_payment')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  {dataService.formatCurrency(payments[0].amount, defaultCurrency)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(payments[0].paymentDate, 'PPP', { locale: es })}
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">{t('no_payments_registered')}</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('payment_records')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => toggleSort('date')}
                  >
                    <div className="flex items-center">
                      {t('date')}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">{t('client')}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('event')}</TableHead>
                  <TableHead>{t('method')}</TableHead>
                  <TableHead 
                    className="cursor-pointer text-right"
                    onClick={() => toggleSort('amount')}
                  >
                    <div className="flex items-center justify-end">
                      {t('amount')}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length > 0 ? (
                  payments.map((payment) => {
                    const { customerName, eventTitle, eventId } = getCustomerAndEvent(payment.eventId);
                    
                    return (
                      <TableRow 
                        key={payment.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/events/${payment.eventId}`)}
                      >
                        <TableCell>
                          {format(payment.paymentDate, 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {customerName}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {eventTitle}
                        </TableCell>
                        <TableCell>
                          {getPaymentMethodText(payment.method)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {dataService.formatCurrency(payment.amount, defaultCurrency)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      {t('no_payments_registered')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPage;
