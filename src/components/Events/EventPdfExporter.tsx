
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Event, Customer, Payment } from '@/types/models';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FilePdf } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { usePDF } from 'react-to-pdf';

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
  const { toPDF, targetRef } = usePDF({
    filename: `Propuesta_${event.title}_${format(new Date(), 'yyyyMMdd')}.pdf`,
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

  // Calculate total payments
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = event.cost - totalPaid;

  return (
    <>
      <Button 
        variant="outline"
        onClick={() => toPDF()}
        className="flex items-center gap-2"
      >
        <FilePdf className="h-4 w-4" />
        Exportar como PDF
      </Button>
      
      <div className="hidden">
        <div ref={targetRef} className="p-8 bg-white max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6 border-b pb-6">
            <h1 className="text-3xl font-bold mb-2">Propuesta de Servicio</h1>
            <p className="text-gray-600">Fecha de emisión: {format(new Date(), 'PPP', { locale: es })}</p>
          </div>
          
          {/* Client Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Información del Cliente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre:</p>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Correo:</p>
                <p className="font-medium">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono:</p>
                <p className="font-medium">{customer.phone}</p>
              </div>
            </div>
          </div>
          
          {/* Event Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Detalles del Evento</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Título:</p>
                <p className="font-medium">{event.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha:</p>
                <p className="font-medium">{format(event.date, 'PPP', { locale: es })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lugar:</p>
                <p className="font-medium">{event.venue}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado:</p>
                <p className="font-medium">{getStatusText(event.status)}</p>
              </div>
            </div>
          </div>
          
          {/* Event Details/Equipment */}
          {eventDetails.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Equipos/Detalles</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2 border">Descripción</th>
                    <th className="text-center p-2 border">Cantidad</th>
                    <th className="text-left p-2 border">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {eventDetails.map((detail, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 border">{detail.description}</td>
                      <td className="p-2 border text-center">{detail.quantity}</td>
                      <td className="p-2 border">{detail.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Financial Summary */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Resumen Financiero</h2>
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Costo Total:</td>
                  <td className="p-2 text-right font-bold">${event.cost?.toLocaleString('es-MX')}</td>
                </tr>
                {payments.length > 0 && (
                  <>
                    <tr className="border-b">
                      <td className="p-2">Pagos Realizados:</td>
                      <td className="p-2 text-right text-green-600 font-bold">
                        ${totalPaid.toLocaleString('es-MX')}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Saldo Pendiente:</td>
                      <td className="p-2 text-right text-amber-600 font-bold">
                        ${pendingAmount.toLocaleString('es-MX')}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Payment History */}
          {payments.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Historial de Pagos</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2 border">Fecha</th>
                    <th className="text-left p-2 border">Método</th>
                    <th className="text-right p-2 border">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 border">{format(payment.paymentDate, 'dd/MM/yyyy')}</td>
                      <td className="p-2 border">{getPaymentMethodText(payment.method)}</td>
                      <td className="p-2 border text-right">${payment.amount.toLocaleString('es-MX')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Terms */}
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-xl font-semibold mb-2">Términos y Condiciones</h2>
            <p className="text-sm text-gray-700">
              Esta propuesta es válida por 30 días a partir de la fecha de emisión. 
              El pago total debe realizarse antes de la fecha del evento.
            </p>
          </div>
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
            <p>Documento generado automáticamente por el Sistema CRM.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventPdfExporter;
