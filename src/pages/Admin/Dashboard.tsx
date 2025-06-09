
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCrm } from '@/contexts/CrmContext';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import dataService from '@/services/DataService';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminDashboard = () => {
  const { customers, events, payments } = useCrm();
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
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

  // Top 5 Clientes por Ingresos
  const topCustomers = customers
    .map(customer => {
      const customerPayments = payments.filter(payment => payment.customerId === customer.id);
      const totalRevenue = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
      return {
        ...customer,
        totalRevenue
      };
    })
    .filter(customer => customer.totalRevenue > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // System health check
  useEffect(() => {
    const checkSystemHealth = () => {
      const issues = [];
      
      // Check for potential issues
      if (events.filter(e => e.status === 'prospect').length > 10) {
        issues.push('Alto número de prospectos sin confirmar');
      }
      
      // Remove payment status check since Payment type doesn't have status property
      
      setSystemHealth({
        status: issues.length > 0 ? 'warning' : 'healthy',
        issues
      });
    };

    checkSystemHealth();
  }, [events, payments]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* System Health Alert */}
      {systemHealth.status === 'warning' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center text-yellow-800 text-sm md:text-base">
              <AlertTriangle className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Alertas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="list-disc list-inside space-y-1 text-yellow-700 text-xs md:text-sm">
              {systemHealth.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{newUsersThisWeek} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              En el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Eventos</CardTitle>
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Eventos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Ingresos Totales</CardTitle>
            <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">
              {dataService.formatCurrency(totalRevenue, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos acumulados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Clientes por Ingresos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Top 5 Clientes por Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          {topCustomers.length > 0 ? (
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-crm-primary text-white rounded-full text-xs md:text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm md:text-base">{customer.name}</p>
                      <p className="text-xs md:text-sm text-gray-600">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm md:text-base text-crm-primary">
                      {dataService.formatCurrency(customer.totalRevenue, 'USD')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">No hay datos de ingresos disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base">Tendencia de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={isMobile ? 10 : 12} />
                <YAxis fontSize={isMobile ? 10 : 12} />
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
            <CardTitle className="text-sm md:text-base">Estado de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
              <PieChart>
                <Pie
                  data={eventStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 60 : 80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  fontSize={isMobile ? 10 : 12}
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
          <CardTitle className="text-sm md:text-base">Acciones del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <Button variant="outline" className="justify-start text-xs md:text-sm">
              <Users className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Gestionar Usuarios
            </Button>
            <Button variant="outline" className="justify-start text-xs md:text-sm">
              <TrendingUp className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Reportes Avanzados
            </Button>
            <Button variant="outline" className="justify-start text-xs md:text-sm">
              <AlertTriangle className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Logs del Sistema
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center space-x-3 md:space-x-4">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
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
