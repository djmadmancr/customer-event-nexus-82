
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, CreditCard, TrendingUp } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import dataService from '@/services/DataService';

const Home = () => {
  const { customers, events } = useCrm();
  const { defaultCurrency } = useAppConfig();
  
  // Get most recent events
  const recentEvents = [...events]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);
  
  // Count events by status
  const pendingEvents = events.filter(event => event.status === 'prospect').length;
  const confirmedEvents = events.filter(event => event.status === 'confirmed').length;
  const paidEvents = events.filter(event => event.status === 'paid').length;
  const completedEvents = events.filter(event => event.status === 'show_completed').length;

  // Calculate total revenue
  const totalRevenue = events.reduce((sum, event) => {
    const eventTotal = event.totalWithTax || event.cost;
    return sum + eventTotal;
  }, 0);
  
  const modules = [
    {
      title: 'Gestión de Clientes',
      description: 'Administra tu cartera de clientes',
      icon: <Users className="h-8 w-8 text-crm-primary" />,
      path: '/customers',
      count: customers.length,
      color: 'bg-crm-accent',
    },
    {
      title: 'Gestión de Eventos',
      description: 'Controla todos los eventos y reuniones',
      icon: <Calendar className="h-8 w-8 text-crm-primary" />,
      path: '/events',
      count: events.length,
      color: 'bg-crm-accent',
    },
    {
      title: 'Registro de Pagos',
      description: 'Seguimiento de pagos y facturación',
      icon: <CreditCard className="h-8 w-8 text-crm-primary" />,
      path: '/payments',
      count: dataService.formatCurrency(totalRevenue, defaultCurrency).replace(/[^\d.,]/g, ''),
      color: 'bg-crm-accent',
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold mb-2">Bienvenido a NEXUS</h1>
        <p className="text-gray-600">
          Gestiona tus clientes, eventos y pagos en un solo lugar
        </p>
      </div>
      
      {/* Modules Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {modules.map((module, index) => (
          <Link to={module.path} key={index}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className={`${module.color} rounded-t-lg p-4`}>
                {module.icon}
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="flex justify-between items-center mb-2">
                  <span>{module.title}</span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                    {module.count}
                  </span>
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
                <Button variant="outline" className="mt-4 w-full">
                  Acceder
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Stats and Recent Events */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Resumen de Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-purple-100 rounded-md">
                <div className="text-sm font-medium">Prospectos</div>
                <div className="text-2xl font-bold">{pendingEvents}</div>
              </div>
              <div className="p-3 bg-blue-100 rounded-md">
                <div className="text-sm font-medium">Confirmados</div>
                <div className="text-2xl font-bold">{confirmedEvents}</div>
              </div>
              <div className="p-3 bg-purple-200 rounded-md">
                <div className="text-sm font-medium">Pagados</div>
                <div className="text-2xl font-bold">{paidEvents}</div>
              </div>
              <div className="p-3 bg-indigo-100 rounded-md">
                <div className="text-sm font-medium">Show Realizado</div>
                <div className="text-2xl font-bold">{completedEvents}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvents.length > 0 ? (
              <ul className="space-y-4">
                {recentEvents.map((event) => {
                  // Get customer name
                  const customer = customers.find(c => c.id === event.customerId);
                  const eventTotal = event.totalWithTax || event.cost;
                  
                  return (
                    <li key={event.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-600">{customer?.name}</p>
                        <p className="text-sm font-semibold text-green-600">
                          {dataService.formatCurrency(eventTotal, defaultCurrency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {format(event.date, "d 'de' MMMM", { locale: es })}
                        </p>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            event.status === 'prospect' ? 'bg-purple-100 text-purple-800' : 
                            event.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            event.status === 'paid' ? 'bg-purple-200 text-purple-900' : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {event.status === 'prospect' ? 'Prospecto' :
                            event.status === 'confirmed' ? 'Confirmado' :
                            event.status === 'paid' ? 'Pagado' : 'Show Realizado'}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No hay eventos recientes</p>
              </div>
            )}
            <Link to="/events">
              <Button variant="outline" className="mt-4 w-full">
                Ver todos los eventos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
