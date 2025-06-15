
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Event, Customer } from '@/types/models';
import { format, isSameDay } from 'date-fns';
import { es, en, pt } from 'date-fns/locale';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import dataService from '@/services/DataService';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface EventCalendarProps {
  events: Event[];
  customers: Customer[];
  onEventClick: (eventId: string) => void;
  onEventEdit: (eventId: string) => void;
  onEventDelete: (eventId: string) => void;
}

const EventCalendar: React.FC<EventCalendarProps> = ({
  events,
  customers,
  onEventClick,
  onEventEdit,
  onEventDelete,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { defaultCurrency } = useAppConfig();
  const { t, currentLanguage } = useLanguage();

  // Get the appropriate locale for date formatting
  const getDateLocale = () => {
    switch (currentLanguage) {
      case 'en':
        return en;
      case 'pt':
        return pt;
      case 'es':
      default:
        return es;
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Cliente desconocido';
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'prospect':
        return <Badge className="bg-purple-200 text-purple-800 text-xs">{t('prospect')}</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-200 text-blue-800 text-xs">{t('confirmed')}</Badge>;
      case 'show_completed':
        return <Badge className="bg-indigo-200 text-indigo-800 text-xs">{t('show_completed')}</Badge>;
      case 'paid':
        return <Badge className="bg-purple-300 text-purple-900 text-xs">{t('paid')}</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  // Get events for selected date
  const selectedDateEvents = events.filter(event => 
    isSameDay(new Date(event.date), selectedDate)
  );

  // Get days with events for calendar highlighting
  const eventDates = events.map(event => new Date(event.date));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>{t('event_calendar')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={getDateLocale()}
            modifiers={{
              hasEvent: eventDates,
            }}
            modifiersStyles={{
              hasEvent: {
                backgroundColor: '#6E59A5',
                color: 'white',
                borderRadius: '50%',
              },
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Events for selected date */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('events_for_date')} {format(selectedDate, "PPPP", { locale: getDateLocale() })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateEvents.length > 0 ? (
            <div className="space-y-4">
              {selectedDateEvents.map((event) => {
                const eventTotal = event.totalWithTax || event.cost;
                return (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{event.title}</h4>
                        <p className="text-sm text-gray-600 mb-1">
                          {t('client')}: {getCustomerName(event.customerId)}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          {t('venue')}: {event.venue}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          {dataService.formatCurrency(eventTotal, defaultCurrency)}
                        </p>
                        <div className="mt-2">
                          {getStatusBadge(event.status)}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEventClick(event.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('view_detail')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEventEdit(event.id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            {t('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => onEventDelete(event.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('no_events_scheduled')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventCalendar;
