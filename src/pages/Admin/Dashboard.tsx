
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCrm } from '@/contexts/CrmContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useAppConfig } from '@/contexts/AppConfigContext';
import dataService from '@/services/DataService';

const Dashboard = () => {
  const { customers, events, payments } = useCrm();
  const { defaultCurrency } = useAppConfig();
  const isMobile = useIsMobile();

  // Calculate statistics
  const totalCustomers = customers.length;
  const totalEvents = events.length;
  const completedEvents = events.filter(event => event.status === 'show_completed').length;
  
  // Calculate total revenue from payments
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate this month's revenue
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthRevenue = payments
    .filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    })
    .reduce((sum, payment) => sum + payment.amount, 0);

  const stats = [
    {
      title: 'Total Clientes',
      value: totalCustomers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Eventos Totales',
      value: totalEvents,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Shows Completados',
      value: completedEvents,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Ingresos Totales',
      value: dataService.formatCurrency(totalRevenue, defaultCurrency),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}>
          Dashboard
        </h1>
      </div>

      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'}`}>
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-2' : 'pb-2'}`}>
              <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`font-bold ${stat.color} ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
        <Card>
          <CardHeader>
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Eventos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className={`flex items-center justify-between ${isMobile ? 'py-2' : 'py-3'} border-b last:border-b-0`}>
                <div>
                  <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{event.title}</p>
                  <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-green-600 font-medium ${isMobile ? 'text-sm' : ''}`}>
                  {dataService.formatCurrency(event.cost, defaultCurrency)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>Ingresos del mes:</span>
              <span className={`font-semibold text-green-600 ${isMobile ? 'text-sm' : ''}`}>
                {dataService.formatCurrency(thisMonthRevenue, defaultCurrency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>Eventos pendientes:</span>
              <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>
                {events.filter(e => e.status === 'confirmed').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>Clientes activos:</span>
              <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>
                {customers.filter(c => c.status === 'active').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
