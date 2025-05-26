
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import dataService from '@/services/DataService';
import { User, Event, Payment, EventStatus } from '@/types/models';
import { useAppConfig } from '@/contexts/AppConfigContext';

type DateFilter = 'last3months' | 'next3months' | 'currentYear' | 'lastYear';

const AdminDashboard: React.FC = () => {
  const { getAllUsers } = useAuth();
  const { defaultCurrency } = useAppConfig();
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState(dataService.getAllEvents());
  const [payments, setPayments] = useState(dataService.getAllPayments());
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState<DateFilter>('currentYear');
  
  // Financial projection data
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  
  // Event status data for charts
  const [eventStatusData, setEventStatusData] = useState<any[]>([]);

  const getDateRange = (filter: DateFilter) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    switch (filter) {
      case 'last3months':
        const start3MonthsAgo = new Date(currentYear, currentMonth - 3, 1);
        return { start: start3MonthsAgo, end: now };
      case 'next3months':
        const end3MonthsLater = new Date(currentYear, currentMonth + 3, 31);
        return { start: now, end: end3MonthsLater };
      case 'currentYear':
        return { 
          start: new Date(currentYear, 0, 1), 
          end: new Date(currentYear, 11, 31) 
        };
      case 'lastYear':
        return { 
          start: new Date(currentYear - 1, 0, 1), 
          end: new Date(currentYear - 1, 11, 31) 
        };
      default:
        return { 
          start: new Date(currentYear, 0, 1), 
          end: new Date(currentYear, 11, 31) 
        };
    }
  };

  const filterEventsByDateRange = (events: Event[], dateRange: { start: Date; end: Date }) => {
    return events.filter(event => 
      event.date >= dateRange.start && event.date <= dateRange.end
    );
  };
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
    
    const dateRange = getDateRange(dateFilter);
    const filteredEvents = filterEventsByDateRange(events, dateRange);
    
    // Process monthly revenue data
    const monthlyData: any[] = [];
    const startYear = dateRange.start.getFullYear();
    const endYear = dateRange.end.getFullYear();
    
    for (let year = startYear; year <= endYear; year++) {
      const startMonth = year === startYear ? dateRange.start.getMonth() : 0;
      const endMonth = year === endYear ? dateRange.end.getMonth() : 11;
      
      for (let month = startMonth; month <= endMonth; month++) {
        const monthEvents = filteredEvents.filter(event => 
          event.date.getFullYear() === year && event.date.getMonth() === month
        );
        
        const monthRevenue = monthEvents.reduce((sum, event) => {
          const eventTotal = event.totalWithTax || event.cost;
          return sum + eventTotal;
        }, 0);
        
        monthlyData.push({
          month: new Date(year, month).toLocaleDateString('es', { month: 'short', year: '2-digit' }),
          ingresos: monthRevenue
        });
      }
    }
    
    setMonthlyRevenue(monthlyData);
    
    // Process event status data
    const statusCounts = {
      prospect: 0,
      confirmed: 0,
      delivered: 0,
      paid: 0
    };
    
    filteredEvents.forEach(event => {
      statusCounts[event.status as EventStatus] += 1;
    });
    
    const eventChartData = [
      { name: 'Prospecto', value: statusCounts.prospect },
      { name: 'Confirmado', value: statusCounts.confirmed },
      { name: 'Servicio Brindado', value: statusCounts.delivered },
      { name: 'Pagado', value: statusCounts.paid },
    ];
    
    setEventStatusData(eventChartData);
    
  }, [getAllUsers, events, payments, dateFilter]);
  
  // Colors for pie chart
  const COLORS = ['#FFD700', '#4169E1', '#FFA500', '#32CD32'];
  
  // Statistics
  const dateRange = getDateRange(dateFilter);
  const filteredEvents = filterEventsByDateRange(events, dateRange);
  const totalEvents = events.length;
  const filteredEventsCount = filteredEvents.length;
  const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.ingresos, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last3months">Últimos 3 meses</SelectItem>
            <SelectItem value="next3months">Próximos 3 meses</SelectItem>
            <SelectItem value="currentYear">Año presente</SelectItem>
            <SelectItem value="lastYear">Año pasado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
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
                <CardTitle className="text-sm font-medium">Eventos (Período)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredEventsCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total: {totalEvents} eventos
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos (Período)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataService.formatCurrency(totalRevenue, defaultCurrency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Proyección del período seleccionado
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Proyección Financiera</CardTitle>
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
                      dataService.getEventsTotalByStatusAndDateRange('paid', dateRange.start, dateRange.end), 
                      defaultCurrency
                    )}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Eventos Confirmados</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {dataService.formatCurrency(
                      dataService.getEventsTotalByStatusAndDateRange('confirmed', dateRange.start, dateRange.end), 
                      defaultCurrency
                    )}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Eventos Entregados</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {dataService.formatCurrency(
                      dataService.getEventsTotalByStatusAndDateRange('delivered', dateRange.start, dateRange.end), 
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
