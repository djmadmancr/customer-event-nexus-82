
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCrm } from '@/contexts/CrmContext';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import dataService from '@/services/DataService';

const AdminDashboard = () => {
  const { customers, events, payments } = useCrm();
  const { currentUser } = useAuth();
  const [systemHealth, setSystemHealth] = useState({ status: 'healthy', issues: [] });

  // Calculate system metrics
  const totalUsers = 1; // In a real app, this would come from user management
  const totalCustomers = customers.length;
  const totalEvents = events.length;
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // User activity metrics
  const activeUsers = 1; // Mock data
  const newUsersThisWeek = 1; // Mock data
  
  // Event status distribution
  const eventStatusData = [
    { name: 'Prospectos', value: events.filter(e => e.status === 'prospect').length, color: '#A855F7' },
    { name: 'Confirmados', value: events.filter(e => e.status === 'confirmed').length, color: '#6366F1' },
    { name: 'Show Realizado', value: events.filter(e => e.status === 'show_completed').length, color: '#8B5CF6' },
    { name: 'Pagados', value: events.filter(e => e.status === 'paid').length, color: '#7C3AED' },
  ];

  // Revenue trend (last 6 months)
  const revenueData = [
    { month: 'Ene', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Abr', revenue: 16000 },
    { month: 'May', revenue: 22000 },
    { month: 'Jun', revenue: 25000 },
  ];

  // System health check
  useEffect(() => {
    const checkSystemHealth = () => {
      const issues = [];
      
      // Check for potential issues
      if (events.filter(e => e.status === 'prospect').length > 10) {
        issues.push('Alto número de prospectos sin confirmar');
      }
      
      if (payments.filter(p => p.status === 'pending').length > 5) {
        issues.push('Múltiples pagos pendientes');
      }

      setSystemHealth({
        status: issues.length > 0 ? 'warning' : 'healthy',
        issues
      });
    };

    checkSystemHealth();
  }, [events, payments]);

  return (
    <div className="space-y-6">
      {/* System Health Alert */}
      {systemHealth.status === 'warning' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Alertas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              {systemHealth.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{newUsersThisWeek} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              En el sistema
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
              Eventos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dataService.formatCurrency(totalRevenue, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos acumulados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [
                    dataService.formatCurrency(value, 'USD'), 
                    'Ingresos'
                  ]}
                />
                <Bar dataKey="revenue" fill="#6E59A5" />
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
                  data={eventStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {eventStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <Users className="mr-2 h-4 w-4" />
              Gestionar Usuarios
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Reportes Avanzados
            </Button>
            <Button variant="outline" className="justify-start">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Logs del Sistema
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center space-x-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <Badge variant="secondary">
                  {event.status === 'prospect' && 'Prospecto'}
                  {event.status === 'confirmed' && 'Confirmado'}
                  {event.status === 'show_completed' && 'Show Realizado'}
                  {event.status === 'paid' && 'Pagado'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
