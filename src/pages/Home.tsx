
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCrm } from '@/contexts/CrmContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
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

const CATEGORY_COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];

interface EventSummary {
  prospect?: number;
  confirmed?: number;
  show_completed?: number;
  paid?: number;
}

const Home = () => {
  const { events, customers, payments } = useCrm();
  const { defaultCurrency } = useAppConfig();
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
  }, {});

  const categoryData = filteredEvents.reduce((acc, event) => {
    const category = event.category || 'Sin categoría';
    const existingCategory = acc.find(item => item.name === category);
  
    if (existingCategory) {
      existingCategory.value += 1;
    } else {
      acc.push({ name: category, value: 1 });
    }
  
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const totalRevenue = filteredEvents.reduce((acc, event) => acc + (event.totalWithTax || event.cost), 0);
  const totalPaid = payments.reduce((acc, payment) => acc + payment.amount, 0);
  const pendingCollection = totalRevenue - totalPaid;

  const pendingCollectionData = [
    { name: 'Cobrado', value: totalPaid },
    { name: 'Pendiente', value: pendingCollection > 0 ? pendingCollection : 0 },
  ];

  const monthlyData = filteredEvents.reduce((acc, event) => {
    const month = new Date(event.date).toLocaleString('default', { month: 'short' });
    const existingMonth = acc.find(item => item.month === month);

    if (existingMonth) {
      existingMonth.programados += event.totalWithTax || event.cost;
    } else {
      acc.push({ month, programados: event.totalWithTax || event.cost, cobrados: 0 });
    }

    return acc;
  }, [] as Array<{ month: string; programados: number; cobrados: number }>);

  payments.forEach(payment => {
    const month = new Date(payment.paymentDate).toLocaleString('default', { month: 'short' });
    const existingMonth = monthlyData.find(item => item.month === month);
    if (existingMonth) {
      existingMonth.cobrados += payment.amount;
    }
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Dashboard de Análisis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <Label htmlFor="start-date">Fecha de Inicio</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end-date">Fecha de Fin</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={applyDateFilter} className="bg-crm-primary hover:bg-crm-primary/90">
              Aplicar Filtro
            </Button>
          </div>

          {/* Event Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-yellow-600">{eventSummary.prospect || 0}</div>
                <div className="text-sm text-gray-600 text-center">Cotizaciones</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-blue-600">{eventSummary.confirmed || 0}</div>
                <div className="text-sm text-gray-600 text-center">Confirmados</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-purple-600">{eventSummary.show_completed || 0}</div>
                <div className="text-sm text-gray-600 text-center">Show Realizado</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-green-600">{eventSummary.paid || 0}</div>
                <div className="text-sm text-gray-600 text-center">Pagados</div>
              </CardContent>
            </Card>
          </div>

          {/* Pie Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribución por Categoría de Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Percentage Pending Collection Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">% Pendiente de Cobrar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pendingCollectionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
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
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Revenue Chart - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ingresos Mensuales - Programados vs Cobrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${defaultCurrency} ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `${defaultCurrency} ${value.toLocaleString()}`, 
                        name === 'programados' ? 'Programados' : 'Cobrados'
                      ]}
                    />
                    <Legend 
                      formatter={(value) => value === 'programados' ? 'Programados' : 'Cobrados'}
                    />
                    <Bar dataKey="programados" fill="#93c5fd" name="programados" />
                    <Bar dataKey="cobrados" fill="#1d4ed8" name="cobrados" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top 5 Clients List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top 5 Clientes por Ingresos</CardTitle>
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
                        {client.eventCount} evento{client.eventCount !== 1 ? 's' : ''}
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
