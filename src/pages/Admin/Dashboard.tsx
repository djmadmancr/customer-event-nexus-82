
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import dataService from '@/services/DataService';
import { User, Event, Payment, EventStatus } from '@/types/models';
import { useAppConfig } from '@/contexts/AppConfigContext';

const AdminDashboard: React.FC = () => {
  const { getAllUsers } = useAuth();
  const { defaultCurrency } = useAppConfig();
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState(dataService.getAllEvents());
  const [payments, setPayments] = useState(dataService.getAllPayments());
  const [activeTab, setActiveTab] = useState('overview');
  
  // Financial projection data for current year
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  
  // Event status data for charts
  const [eventStatusData, setEventStatusData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    // Fetch users data
    fetchUsers();
    
    // Process current year financial data
    const currentYear = new Date().getFullYear();
    const monthlyData = Array.from({ length: 12 }, (_, index) => ({
      month: new Date(currentYear, index).toLocaleDateString('es', { month: 'short' }),
      ingresos: 0
    }));
    
    // Calculate monthly revenue from events in current year
    events
      .filter(event => event.date.getFullYear() === currentYear)
      .forEach(event => {
        const month = event.date.getMonth();
        const eventTotal = event.totalWithTax || event.cost;
        monthlyData[month].ingresos += eventTotal;
      });
    
    setMonthlyRevenue(monthlyData);
    
    // Process event status data
    const statusCounts = {
      prospect: 0,
      confirmed: 0,
      delivered: 0,
      paid: 0
    };
    
    events.forEach(event => {
      statusCounts[event.status as EventStatus] += 1;
    });
    
    // Prepare chart data
    const eventChartData = [
      { name: 'Prospecto', value: statusCounts.prospect },
      { name: 'Confirmado', value: statusCounts.confirmed },
      { name: 'Servicio Brindado', value: statusCounts.delivered },
      { name: 'Pagado', value: statusCounts.paid },
    ];
    
    setEventStatusData(eventChartData);
    
  }, [getAllUsers, events, payments]);
  
  // Colors for pie chart
  const COLORS = ['#FFD700', '#4169E1', '#FFA500', '#32CD32'];
  
  // Statistics
  const totalEvents = events.length;
  const currentYearEvents = events.filter(event => event.date.getFullYear() === new Date().getFullYear()).length;
  const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.ingresos, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="finances">Finanzas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Usuarios registrados en la plataforma
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos {new Date().getFullYear()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentYearEvents}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total: {totalEvents} eventos
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos {new Date().getFullYear()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataService.formatCurrency(totalRevenue, defaultCurrency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Proyección anual
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Proyección Financiera {new Date().getFullYear()}</CardTitle>
              </CardHeader>
              <CardContent style={{ height: '350px' }}>
                <ChartContainer
                  config={{
                    ingresos: { label: "Ingresos", color: "#4169E1" },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenue}>
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => dataService.formatCurrency(value, defaultCurrency)} />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value: any) => [dataService.formatCurrency(value, defaultCurrency), 'Ingresos']}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="ingresos" 
                        stroke="#4169E1" 
                        strokeWidth={3}
                        dot={{ fill: '#4169E1', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Eventos por Estado</CardTitle>
              </CardHeader>
              <CardContent style={{ height: '350px' }}>
                <ChartContainer
                  config={{
                    prospect: { label: "Prospecto", color: "#FFD700" },
                    confirmed: { label: "Confirmado", color: "#4169E1" },
                    delivered: { label: "Servicio Brindado", color: "#FFA500" },
                    paid: { label: "Pagado", color: "#32CD32" },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {eventStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="finances" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen Financiero Detallado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Eventos Pagados</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {dataService.formatCurrency(
                      dataService.getEventsTotalByStatus('paid'), 
                      defaultCurrency
                    )}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Eventos Confirmados</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {dataService.formatCurrency(
                      dataService.getEventsTotalByStatus('confirmed'), 
                      defaultCurrency
                    )}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Eventos Entregados</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {dataService.formatCurrency(
                      dataService.getEventsTotalByStatus('delivered'), 
                      defaultCurrency
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
