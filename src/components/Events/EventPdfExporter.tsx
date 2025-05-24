
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Event, Customer, Payment } from '@/types/models';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { usePDF } from 'react-to-pdf';
import dataService from '@/services/DataService';

interface EventPdfExporterProps {
  event: Event;
  customer: Customer;
  payments?: Payment[];
  eventDetails?: any[];
}

const EventPdfExporter: React.FC<EventPdfExporterProps> = ({
  event,
  customer,
  payments = [],
  eventDetails = [],
}) => {
  const { userProfile } = useUserProfile();
  const { logoUrl, defaultCurrency } = useAppConfig();
  const { toPDF, targetRef } = usePDF({
    filename: `Propuesta_${event.title}_${format(new Date(), 'yyyyMMdd')}.pdf`,
    page: {
      margin: 20,
      format: 'A4',
    },
  });

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
  
  // Get status badge text
  const getStatusText = (status: string) => {
    switch(status) {
      case 'prospect': return 'Prospecto';
      case 'confirmed': return 'Confirmado';
      case 'delivered': return 'Servicio Brindado';
      case 'paid': return 'Pagado';
      default: return status;
    }
  };

  // Calculate total payments and event totals
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const eventTotal = event.totalWithTax || event.cost;
  const pendingAmount = eventTotal - totalPaid;

  // Format currency based on default currency
  const formatCurrency = (amount: number) => {
    return dataService.formatCurrency(amount, defaultCurrency);
  };

  return (
    <>
      <Button 
        variant="outline"
        onClick={() => toPDF()}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Exportar como PDF
      </Button>
      
      <div className="fixed top-[-9999px] left-[-9999px]">
        <div ref={targetRef} className="p-8 bg-white max-w-4xl mx-auto" style={{ width: '794px', minHeight: '1123px' }}>
          {/* Header with Logo and Business Info */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-gray-300 pb-6">
            <div className="flex items-center">
              {logoUrl && (
                <div className="mr-4">
                  <img 
                    src={logoUrl} 
                    alt="Logo de la empresa" 
                    className="h-20 max-w-48 object-contain"
                    style={{ maxHeight: '80px', maxWidth: '192px' }}
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {userProfile?.artistName || userProfile?.name || 'NEXUS'}
                </h1>
                <p className="text-lg text-gray-600">Propuesta de Servicio</p>
                {userProfile && (
                  <div className="mt-2 text-sm text-gray-600">
                    {userProfile.email && <p>Email: {userProfile.email}</p>}
                    {userProfile.phone && <p>Teléfono: {userProfile.phone}</p>}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">Fecha: {format(new Date(), 'dd/MM/yyyy', { locale: es })}</p>
              <p className="text-sm text-gray-600">Propuesta #{event.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          
          {/* Client Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">Información del Cliente</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Nombre Completo:</p>
                <p className="text-lg font-medium text-gray-800">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Correo Electrónico:</p>
                <p className="text-lg font-medium text-gray-800">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Teléfono:</p>
                <p className="text-lg font-medium text-gray-800">{customer.phone}</p>
              </div>
            </div>
          </div>
          
          {/* Event Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">Detalles del Evento</h2>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Título del Evento:</p>
                <p className="text-lg font-medium text-gray-800">{event.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha del Evento:</p>
                <p className="text-lg font-medium text-gray-800">{format(event.date, 'PPP', { locale: es })}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ubicación:</p>
                <p className="text-lg font-medium text-gray-800">{event.venue}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Estado:</p>
                <p className="text-lg font-medium text-gray-800">{getStatusText(event.status)}</p>
              </div>
            </div>
          </div>
          
          {/* Event Details/Services */}
          {eventDetails.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">Servicios Contratados</h2>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 border border-gray-300 font-semibold">Descripción del Servicio</th>
                    <th className="text-center p-3 border border-gray-300 font-semibold">Cantidad</th>
                    <th className="text-left p-3 border border-gray-300 font-semibold">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {eventDetails.map((detail, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 border border-gray-300">{detail.description}</td>
                      <td className="p-3 border border-gray-300 text-center font-medium">{detail.quantity}</td>
                      <td className="p-3 border border-gray-300">{detail.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Financial Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">Resumen Financiero</h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="py-3 text-lg font-medium">Costo Base del Evento:</td>
                    <td className="py-3 text-right text-xl font-bold text-gray-800">
                      {formatCurrency(event.cost)}
                    </td>
                  </tr>
                  {event.taxPercentage && event.taxAmount && (
                    <tr className="border-b border-gray-300">
                      <td className="py-3 text-lg font-medium">Impuestos ({event.taxPercentage}%):</td>
                      <td className="py-3 text-right text-xl font-bold text-gray-800">
                        {formatCurrency(event.taxAmount)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-b border-gray-300">
                    <td className="py-3 text-lg font-medium">Costo Total del Evento:</td>
                    <td className="py-3 text-right text-2xl font-bold text-gray-800">
                      {formatCurrency(eventTotal)}
                    </td>
                  </tr>
                  {payments.length > 0 && (
                    <>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 text-lg font-medium">Pagos Realizados:</td>
                        <td className="py-3 text-right text-xl font-bold text-green-600">
                          {formatCurrency(totalPaid)}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 text-lg font-medium">Saldo Pendiente:</td>
                        <td className="py-3 text-right text-xl font-bold text-amber-600">
                          {formatCurrency(pendingAmount)}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Payment History */}
          {payments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">Historial de Pagos</h2>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 border border-gray-300 font-semibold">Fecha de Pago</th>
                    <th className="text-left p-3 border border-gray-300 font-semibold">Método de Pago</th>
                    <th className="text-right p-3 border border-gray-300 font-semibold">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 border border-gray-300">{format(payment.paymentDate, 'dd/MM/yyyy')}</td>
                      <td className="p-3 border border-gray-300">{getPaymentMethodText(payment.method)}</td>
                      <td className="p-3 border border-gray-300 text-right font-bold">
                        {formatCurrency(payment.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Terms and Conditions - Now using event comments */}
          {event.comments && (
            <div className="mb-8 pt-6 border-t-2 border-gray-300">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Términos y Condiciones</h2>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {event.comments}
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="pt-6 border-t border-gray-300 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Gracias por confiar en {userProfile?.artistName || userProfile?.name || 'NEXUS'} para su evento especial.
            </p>
            <p className="text-xs text-gray-400">
              Documento generado automáticamente el {format(new Date(), 'PPP', { locale: es })}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventPdfExporter;
