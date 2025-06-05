
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Inbox, Plus } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { useEmailConfig } from '@/contexts/EmailConfigContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CustomerEmailsProps {
  customerId: string;
}

const CustomerEmails: React.FC<CustomerEmailsProps> = ({ customerId }) => {
  const { events } = useCrm();
  const { isConfigured } = useEmailConfig();
  const [activeView, setActiveView] = useState<'inbox' | 'compose'>('inbox');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Filter events for this customer
  const customerEvents = events.filter(event => event.customerId === customerId);

  // Mock emails - in real implementation, these would come from IMAP
  const mockEmails = [
    {
      id: '1',
      subject: 'Consulta sobre cotización',
      from: 'cliente@email.com',
      date: new Date('2023-12-01'),
      eventId: customerEvents[0]?.id,
      preview: 'Hola, me gustaría saber más detalles sobre...',
      read: true,
    },
    {
      id: '2',
      subject: 'Confirmación de evento',
      from: 'cliente@email.com',
      date: new Date('2023-12-02'),
      eventId: customerEvents[0]?.id,
      preview: 'Perfecto, confirmo que el evento será...',
      read: false,
    },
  ];

  const handleSendEmail = () => {
    if (!isConfigured) {
      alert('Por favor configura las credenciales de email primero');
      return;
    }

    if (!selectedEvent || !emailSubject || !emailBody) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Here would be the actual email sending logic
    console.log('Sending email:', {
      eventId: selectedEvent,
      subject: emailSubject,
      body: emailBody,
    });

    // Reset form
    setEmailSubject('');
    setEmailBody('');
    setSelectedEvent('');
    setActiveView('inbox');

    alert('Email enviado correctamente');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Comunicación por Email
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={activeView === 'inbox' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('inbox')}
              >
                <Inbox className="h-4 w-4 mr-2" />
                Bandeja
              </Button>
              <Button
                variant={activeView === 'compose' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('compose')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Email
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeView === 'inbox' ? (
            <div className="space-y-4">
              {!isConfigured && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Para recibir emails, configura las credenciales IMAP en Configuración → Email.
                  </p>
                </div>
              )}
              
              {mockEmails.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay emails para este cliente
                </div>
              ) : (
                <div className="space-y-2">
                  {mockEmails.map((email) => {
                    const relatedEvent = customerEvents.find(e => e.id === email.eventId);
                    return (
                      <div
                        key={email.id}
                        className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                          !email.read ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{email.subject}</span>
                              {!email.read && (
                                <Badge variant="default" className="text-xs">Nuevo</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              De: {email.from}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              {relatedEvent && (
                                <span className="text-blue-600">
                                  Evento: {relatedEvent.title}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{email.preview}</p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(email.date, 'dd/MM/yyyy HH:mm', { locale: es })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
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
                  Evento Relacionado
                </label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un evento" />
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

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveView('inbox')}
                >
                  Cancelar
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerEmails;
