
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCrm } from '@/contexts/CrmContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { es, en, pt } from 'date-fns/locale';
import { Calendar, Plus, Search, Eye, Edit, Trash2, List } from 'lucide-react';
import FinancialSummary from '@/components/Events/FinancialSummary';
import EventCalendar from '@/components/Events/EventCalendar';

const EventList = () => {
  const { events, customers, removeEvent } = useCrm();
  const { defaultCurrency } = useAppConfig();
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
    return customer ? customer.name : 'Cliente no encontrado';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      prospect: { label: t('quotation'), className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: t('confirmed'), className: 'bg-blue-100 text-blue-800' },
      show_completed: { label: t('show_completed'), className: 'bg-purple-100 text-purple-800' },
      paid: { label: t('paid'), className: 'bg-green-100 text-green-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
      { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      wedding: { label: t('wedding'), className: 'bg-pink-100 text-pink-800' },
      birthday: { label: t('birthday'), className: 'bg-orange-100 text-orange-800' },
      corporate: { label: t('corporate'), className: 'bg-blue-100 text-blue-800' },
      club: { label: t('club'), className: 'bg-purple-100 text-purple-800' },
      other: { label: t('other'), className: 'bg-gray-100 text-gray-800' },
    };
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || 
      { label: category || t('uncategorized'), className: 'bg-gray-100 text-gray-800' };
    
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const filteredEvents = events.filter(event => {
    const customerName = getCustomerName(event.customerId).toLowerCase();
    const eventTitle = event.title.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = customerName.includes(searchLower) || 
                         eventTitle.includes(searchLower);
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await removeEvent(eventId);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleEventEdit = (eventId: string) => {
    navigate(`/events/${eventId}/edit`);
  };

  const handleEventDelete = (eventId: string) => {
    handleDeleteEvent(eventId);
  };

  // Format current date with proper localization
  const currentDate = format(new Date(), 'PPPP', { locale: getDateLocale() });

  return (
    <div className="space-y-6">
      <FinancialSummary />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              {t('events')}: {currentDate}
            </CardTitle>
            <Button onClick={() => navigate('/events/new')}>
              <Plus className="mr-2 h-4 w-4" />
              {t('new_event')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                {t('list')}
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('calendar')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={t('search_by_customer_or_event')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all')}</SelectItem>
                      <SelectItem value="prospect">{t('quotation')}</SelectItem>
                      <SelectItem value="confirmed">{t('confirmed')}</SelectItem>
                      <SelectItem value="show_completed">{t('show_completed')}</SelectItem>
                      <SelectItem value="paid">{t('paid')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all_categories')}</SelectItem>
                      <SelectItem value="wedding">{t('wedding')}</SelectItem>
                      <SelectItem value="birthday">{t('birthday')}</SelectItem>
                      <SelectItem value="corporate">{t('corporate')}</SelectItem>
                      <SelectItem value="club">{t('club')}</SelectItem>
                      <SelectItem value="other">{t('other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('client')}</TableHead>
                      <TableHead>{t('title')}</TableHead>
                      <TableHead>{t('date')}</TableHead>
                      <TableHead>{t('category')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('total')} ({defaultCurrency})</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          {getCustomerName(event.customerId)}
                        </TableCell>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>
                          {format(new Date(event.date), 'dd/MM/yyyy', { locale: getDateLocale() })}
                        </TableCell>
                        <TableCell>{getCategoryBadge(event.category)}</TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(event.totalWithTax || event.cost)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/events/${event.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/events/${event.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {events.length === 0 ? 
                    t('no_events_registered') : 
                    t('no_events_found')
                  }
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="calendar">
              <EventCalendar
                events={filteredEvents}
                customers={customers}
                onEventClick={handleEventClick}
                onEventEdit={handleEventEdit}
                onEventDelete={handleEventDelete}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventList;
