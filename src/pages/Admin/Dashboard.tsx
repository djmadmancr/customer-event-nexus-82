import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import dataService from '@/services/DataService';
import { doc, collection, getDocs, query, where, getDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { User, Event, Payment, EventStatus } from '@/types/models';
import AppSettingsForm from '@/components/Admin/AppSettingsForm';

const AdminDashboard: React.FC = () => {
  const { getAllUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState(dataService.getAllEvents());
  const [payments, setPayments] = useState(dataService.getAllPayments());
  const [activeTab, setActiveTab] = useState('overview');
  
  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    totalEvents: 0,
    totalPayments: 0,
    totalPaymentAmount: 0
  });
  
  // Event status data for charts
  const [eventStatusData, setEventStatusData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
        
        // Calculate user statistics
        setStats(prevStats => ({
          ...prevStats,
          totalUsers: usersData.length,
          adminUsers: usersData.filter(user => user.role === 'admin').length,
          regularUsers: usersData.filter(user => user.role === 'user').length
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    // Fetch users data
    fetchUsers();
    
    // Process event data
    const totalEvents = events.length;
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
    
    // Calculate total payments
    const totalPaymentAmount = payments.reduce(
      (sum, payment) => sum + payment.amount, 
      0
    );
    
    setStats(prevStats => ({
      ...prevStats,
      totalEvents,
      totalPayments: payments.length,
      totalPaymentAmount
    }));
    
  }, [getAllUsers, events, payments]);
  
  // Colors for pie chart
  const COLORS = ['#FFD700', '#4169E1', '#FFA500', '#32CD32'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="finances">Finanzas</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.adminUsers} administradores, {stats.regularUsers} usuarios
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalPaymentAmount.toLocaleString('es-MX')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalPayments} pagos registrados
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Eventos por Estado</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center" style={{ height: '300px' }}>
                <ChartContainer
                  config={{
                    prospect: { label: "Prospecto", color: "#FFD700" },
                    confirmed: { label: "Confirmado", color: "#4169E1" },
                    delivered: { label: "Servicio Brindado", color: "#FFA500" },
                    paid: { label: "Pagado", color: "#32CD32" },
                  }}
                >
                  <PieChart width={300} height={300}>
                    <Pie
                      data={eventStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
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
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Eventos</CardTitle>
              </CardHeader>
              <CardContent style={{ height: '300px' }}>
                <ChartContainer
                  config={{
                    prospect: { label: "Prospecto", color: "#FFD700" },
                    confirmed: { label: "Confirmado", color: "#4169E1" },
                    delivered: { label: "Servicio Brindado", color: "#FFA500" },
                    paid: { label: "Pagado", color: "#32CD32" },
                  }}
                >
                  <BarChart
                    width={500}
                    height={300}
                    data={eventStatusData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Cantidad" 
                      fill="#8884d8" 
                    >
                      {eventStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
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
              <p>Contenido detallado de usuarios (Implementar en UserManagement)</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="finances" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Contenido detallado de finanzas (Implementar)</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de la Aplicación</CardTitle>
            </CardHeader>
            <CardContent>
              <AppSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
