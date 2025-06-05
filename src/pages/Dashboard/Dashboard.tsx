
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, Calendar, Coins } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import dataService from '@/services/DataService';

const Dashboard = () => {
  const { customers, events } = useCrm();
  const { defaultCurrency } = useAppConfig();
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [projectionData, setProjectionData] = useState<any[]>([]);

  // Calculate stats
  const totalCustomers = customers.length;
  const totalEvents = events.length;
  const upcomingEvents = events.filter(event => 
    event.date >= new Date() && 
    event.date <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length;
  
  const totalRevenue = events
    .filter(event => event.status === 'paid')
    .reduce((sum, event) => sum + event.cost, 0);

  // Event status distribution
  const statusData = [
    { name: 'Prospectos', value: events.filter(e => e.status === 'prospect').length, color: '#f59e0b' },
    { name: 'Confirmados', value: events.filter(e => e.status === 'confirmed').length, color: '#3b82f6' },
    { name: 'Entregados', value: events.filter(e => e.status === 'delivered').length, color: '#10b981' },
    { name: 'Pagados', value: events.filter(e => e.status === 'paid').length, color: '#22c55e' },
  ];

  useEffect(() => {
    // Calculate monthly data for the complete months
    const monthlyRevenue: { [key: string]: number } = {};
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Get data for the last 12 complete months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentDate.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      monthlyRevenue[monthKey] = 0;
    }

    events.forEach(event => {
      if (event.status === 'paid') {
        const eventDate = new Date(event.date);
        const monthKey = eventDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
        if (monthlyRevenue.hasOwnProperty(monthKey)) {
          monthlyRevenue[monthKey] += event.cost;
        }
      }
    });

    const chartData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    setMonthlyData(chartData);

    // Calculate projection for current month and next 2 months
    const projectionMonths = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(currentYear, currentDate.getMonth() + i, 1);
      const monthKey = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      
      const monthRevenue = events
        .filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.getMonth() === date.getMonth() && 
                 eventDate.getFullYear() === date.getFullYear() &&
                 (event.status === 'confirmed' || event.status === 'delivered' || event.status === 'paid');
        })
        .reduce((sum, event) => sum + event.cost, 0);

      projectionMonths.push({
        month: monthKey,
        projected: monthRevenue,
      });
    }

    setProjectionData(projectionMonths);
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +{customers.filter(c => {
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return c.createdAt >= weekAgo;
              }).length} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              +{events.filter(e => {
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return e.createdAt >= weekAgo;
              }).length} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              En los próximos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dataService.formatCurrency(totalRevenue, defaultCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Eventos pagados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [
                    dataService.formatCurrency(value, defaultCurrency), 
                    'Ingresos'
                  ]}
                />
                <Bar dataKey="revenue" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Financial Projection */}
      <Card>
        <CardHeader>
          <CardTitle>Proyección Financiera - Próximos 3 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [
                  dataService.formatCurrency(value, defaultCurrency), 
                  'Proyectado'
                ]}
              />
              <Bar dataKey="projected" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
