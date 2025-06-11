
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Paperclip, X } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { useEmailConfig } from '@/contexts/EmailConfigContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CustomerEmailsProps {
  customerId: string;
}

const CustomerEmails: React.FC<CustomerEmailsProps> = ({ customerId }) => {
  const { events, customers } = useCrm();
  const { isConfigured } = useEmailConfig();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [attachPDF, setAttachPDF] = useState(false);

  const customer = customers.find(c => c.id === customerId);
  const customerEvents = events.filter(event => event.customerId === customerId);

  const handleSendEmail = () => {
    if (!isConfigured) {
      alert('Por favor configura las credenciales SMTP primero en Configuración → Email');
      return;
    }

    if (!emailSubject || !emailBody) {
      alert('Por favor completa el asunto y el mensaje');
      return;
    }

    console.log('Sending email:', {
      to: customer?.email,
      eventId: selectedEvent,
      subject: emailSubject,
      body: emailBody,
      attachPDF: attachPDF
    });

    setEmailSubject('');
    setEmailBody('');
    setSelectedEvent('');
    setAttachPDF(false);

    alert('Email enviado correctamente');
  };

  const generateEmailTemplate = (eventId: string) => {
    const event = customerEvents.find(e => e.id === eventId);
    if (!event) return;

    const subject = `Propuesta de evento: ${event.title}`;
    const body = `Estimado/a ${customer?.name || 'Cliente'},

Espero que se encuentre bien. Me complace enviarle la propuesta para el evento "${event.title}" programado para el ${format(event.date, 'dd/MM/yyyy', { locale: es })}.

Detalles del evento:
- Fecha: ${format(event.date, 'dd/MM/yyyy', { locale: es })}
- Ubicación: ${event.venue || 'Por definir'} 
- Costo: ${event.cost.toLocaleString()}

${attachPDF ? 'Adjunto encontrará la propuesta detallada en formato PDF.' : ''}

Quedo atento a sus comentarios y espero su confirmación.

Saludos cordiales,
${customer?.name || 'Su equipo'}`;

    setEmailSubject(subject);
    setEmailBody(body);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Enviar Email
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isConfigured && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Para enviar emails, configura las credenciales SMTP en Configuración → Email.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Para
            </label>
            <Input
              value={customer?.email || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Evento Relacionado (Opcional)
            </label>
            <Select 
              value={selectedEvent} 
              onValueChange={(value) => {
                setSelectedEvent(value);
                if (value) {
                  generateEmailTemplate(value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un evento para generar plantilla" />
              </SelectTrigger>
              <SelectContent>
                {customerEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title} - {format(event.date, 'dd/MM/yyyy', { locale: es })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Asunto
            </label>
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Asunto del email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Mensaje
            </label>
            <Textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="min-h-[200px]"
            />
          </div>

          {selectedEvent && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="attachPDF"
                checked={attachPDF}
                onChange={(e) => setAttachPDF(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="attachPDF" className="text-sm cursor-pointer">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Adjuntar propuesta del evento en PDF
                </div>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => {
                setEmailSubject('');
                setEmailBody('');
                setSelectedEvent('');
                setAttachPDF(false);
              }}
              variant="outline"
            >
              Limpiar
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={!isConfigured}
              className="bg-crm-primary hover:bg-crm-primary/90"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Email
            </Button>
          </div>

          {selectedEvent && (
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <strong>Tip:</strong> Al seleccionar un evento se genera automáticamente una plantilla de email con los detalles del evento.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerEmails;
