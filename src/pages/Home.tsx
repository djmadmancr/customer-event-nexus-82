import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCrm } from '@/contexts/CrmContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useNotifications } from '@/contexts/NotificationContext';
import dataService from '@/services/DataService';

const CATEGORY_COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];

interface EventSummary {
  prospect: number;
  confirmed: number;
  show_completed: number;
  paid: number;
}

const Home = () => {
  const { events, customers, payments } = useCrm();
  const { defaultCurrency } = useAppConfig();
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredEvents, setFilteredEvents] = useState(events);

  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  const applyDateFilter = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const filtered = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= start && eventDate <= end;
      });

      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  };

  const eventSummary: EventSummary = filteredEvents.reduce((acc: EventSummary, event) => {
    const status = event.status as keyof EventSummary;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { prospect: 0, confirmed: 0, show_completed: 0, paid: 0 });

  const categoryData = filteredEvents.reduce((acc, event) => {
    const category = event.category || t('uncategorized');
    const existingCategory = acc.find(item => item.name === category);
  
    if (existingCategory) {
      existingCategory.value += 1;
    } else {
      acc.push({ name: category, value: 1 });
    }
  
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const totalRevenue = filteredEvents.reduce((acc, event) => acc + (event.totalWithTax || event.cost), 0);
  const totalPaid = filteredEvents
    .flatMap(event => dataService.getPaymentsByEventId(event.id))
    .reduce((acc, payment) => acc + payment.amount, 0);
  const pendingCollection = totalRevenue - totalPaid;

  const pendingCollectionData = [
    { name: t('collected'), value: totalPaid },
    { name: t('pending'), value: pendingCollection > 0 ? pendingCollection : 0 },
  ];

  const monthlyData = filteredEvents.reduce((acc, event) => {
    const eventDate = new Date(event.date);
    const month = eventDate.toLocaleString('default', { month: 'short' });
    const monthNumber = eventDate.getMonth(); // Get month number for sorting
    const year = eventDate.getFullYear();
    const monthKey = `${year}-${monthNumber.toString().padStart(2, '0')}`; // YYYY-MM format for sorting
    
    const existingMonth = acc.find(item => item.monthKey === monthKey);

    if (existingMonth) {
      existingMonth.programados += event.totalWithTax || event.cost;
    } else {
      acc.push({ 
        month, 
        monthKey,
        monthNumber,
        year,
        programados: event.totalWithTax || event.cost, 
        cobrados: 0 
      });
    }

    return acc;
  }, [] as Array<{ month: string; monthKey: string; monthNumber: number; year: number; programados: number; cobrados: number }>);

  const allPaymentsForFilteredEvents = filteredEvents.flatMap(event => dataService.getPaymentsByEventId(event.id));

  allPaymentsForFilteredEvents.forEach(payment => {
    const paymentDate = new Date(payment.paymentDate);
    const month = paymentDate.toLocaleString('default', { month: 'short' });
    const monthNumber = paymentDate.getMonth();
    const year = paymentDate.getFullYear();
    const monthKey = `${year}-${monthNumber.toString().padStart(2, '0')}`;
    
    let existingMonth = monthlyData.find(item => item.monthKey === monthKey);
    if (!existingMonth) {
      existingMonth = { 
        month, 
        monthKey,
        monthNumber,
        year,
        programados: 0, 
        cobrados: 0 
      };
      monthlyData.push(existingMonth);
    }
    existingMonth.cobrados += payment.amount;
  });

  const sortedMonthlyData = monthlyData.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.monthNumber - b.monthNumber;
  });

  const topClients = customers.map(customer => {
    const customerEvents = filteredEvents.filter(event => event.customerId === customer.id);
    const totalRevenue = customerEvents.reduce((acc, event) => acc + (event.totalWithTax || event.cost), 0);
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      totalRevenue,
      eventCount: customerEvents.length,
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);

  return (
    <div className="w-full max-w-none">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">{t('dashboard')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 w-full">
          {/* Date Range Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end w-full">
            <div className="flex-1">
              <Label htmlFor="start-date">{t('start_date')}</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end-date">{t('end_date')}</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={applyDateFilter} className="bg-crm-primary hover:bg-crm-primary/90">
              {t('apply_filter')}
            </Button>
          </div>

          {/* Event Status Summary - Full Width */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-yellow-600">{eventSummary.prospect}</div>
                <div className="text-sm text-gray-600 text-center">{t('quotes')}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-blue-600">{eventSummary.confirmed}</div>
                <div className="text-sm text-gray-600 text-center">{t('confirmed')}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-purple-600">{eventSummary.show_completed}</div>
                <div className="text-sm text-gray-600 text-center">{t('show_completed')}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-green-600">{eventSummary.paid}</div>
                <div className="text-sm text-gray-600 text-center">{t('paid')}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row - Full Width */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
            {/* Category Distribution Chart */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg">{t('event_categories')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Percentage Pending Collection Chart */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg">{t('collection')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pendingCollectionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pendingCollectionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`${defaultCurrency} ${value.toLocaleString()}`, '']}
                      />
                       <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Clients List */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg">{t('top_clients')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topClients.slice(0, 3).map((client, index) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-crm-primary text-white rounded-full font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm truncate">{client.name}</h3>
                          <p className="text-xs text-gray-600 truncate">{client.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">
                          {defaultCurrency} {client.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">
                          {client.eventCount} {t('event')}{client.eventCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Revenue Chart - Full Width */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg">{t('revenue')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedMonthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${defaultCurrency} ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `${defaultCurrency} ${value.toLocaleString()}`, 
                        name === 'programados' ? t('programados') : t('cobrados')
                      ]}
                    />
                    <Legend 
                      formatter={(value) => value === 'programados' ? t('programados') : t('cobrados')}
                    />
                    <Bar dataKey="programados" fill="#93c5fd" name="programados" />
                    <Bar dataKey="cobrados" fill="#1d4ed8" name="cobrados" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Full Client List */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg">{t('top_clients')} - Lista Completa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClients.map((client, index) => (
                  <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-crm-primary text-white rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-sm text-gray-600">{client.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {defaultCurrency} {client.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {client.eventCount} {t('event')}{client.eventCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
