
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, Calendar as CalendarIcon } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import dataService from '@/services/DataService';

type DateFilter = 'currentMonth' | 'last3months' | 'next3months' | 'currentYear' | 'lastYear';

const Dashboard: React.FC = () => {
  const { events } = useCrm();
  const { defaultCurrency } = useAppConfig();
  const [dateFilter, setDateFilter] = useState<DateFilter>('currentYear');
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [eventStatusData, setEventStatusData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRevenue: 0,
    paidEvents: 0,
    pendingEvents: 0
  });

  // Financial summary state (using same filter as main dashboard)
  const [paidTotal, setPaidTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);

  const getDateRange = (filter: DateFilter) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    switch (filter) {
      case 'currentMonth':
        return { 
          start: new Date(currentYear, currentMonth, 1), 
          end: new Date(currentYear, currentMonth + 1, 0) 
        };
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

  const filterEventsByDateRange = (events: any[], dateRange: { start: Date; end: Date }) => {
    return events.filter(event => 
      event.date >= dateRange.start && event.date <= dateRange.end
    );
  };

  useEffect(() => {
    const dateRange = getDateRange(dateFilter);
    const filteredEvents = filterEventsByDateRange(events, dateRange);
    
    // Get all payments within the date range
    const allPayments = dataService.getAllPayments();
    const filteredPayments = allPayments.filter(payment => 
      payment.paymentDate >= dateRange.start && payment.paymentDate <= dateRange.end
    );
    
    // Process monthly revenue data based on actual payments
    const monthlyData: any[] = [];
    const startYear = dateRange.start.getFullYear();
    const endYear = dateRange.end.getFullYear();
    
    for (let year = startYear; year <= endYear; year++) {
      const startMonth = year === startYear ? dateRange.start.getMonth() : 0;
      const endMonth = year === endYear ? dateRange.end.getMonth() : 11;
      
      for (let month = startMonth; month <= endMonth; month++) {
        const monthPayments = filteredPayments.filter(payment => 
          payment.paymentDate.getFullYear() === year && payment.paymentDate.getMonth() === month
        );
        
        const monthRevenue = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
        
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
      if (statusCounts.hasOwnProperty(event.status)) {
        statusCounts[event.status as keyof typeof statusCounts] += 1;
      }
    });
    
    const eventChartData = [
      { name: 'Prospecto', value: statusCounts.prospect, color: '#FFD700' },
      { name: 'Confirmado', value: statusCounts.confirmed, color: '#4169E1' },
      { name: 'Servicio Brindado', value: statusCounts.delivered, color: '#FFA500' },
      { name: 'Pagado', value: statusCounts.paid, color: '#32CD32' },
    ];
    
    setEventStatusData(eventChartData);

    // Calculate stats based on actual payments
    const totalRevenue = monthlyData.reduce((sum, month) => sum + month.ingresos, 0);
    const paidEvents = filteredEvents.filter(e => e.status === 'paid').length;
    const pendingEvents = filteredEvents.filter(e => e.status === 'prospect').length;

    setStats({
      totalEvents: filteredEvents.length,
      totalRevenue,
      paidEvents,
      pendingEvents
    });

    // Financial summary calculations using actual payments
    const paidPayments = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    setPaidTotal(paidPayments);

    // For pending, calculate from events minus payments
    const totalEventValue = filteredEvents.reduce((sum, event) => sum + (event.totalWithTax || event.cost), 0);
    setPendingTotal(totalEventValue - paidPayments);

  }, [events, dateFilter]);

  const COLORS = ['#FFD700', '#4169E1', '#FFA500', '#32CD32'];

  const formatCurrencyValue = (value: any) => {
    return `${value.toLocaleString('es-CR')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido a NEXUS - Sistema de Gestión CRM
          </p>
        </div>
        <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="currentMonth">Mes presente</SelectItem>
            <SelectItem value="last3months">Últimos 3 meses</SelectItem>
            <SelectItem value="next3months">Próximos 3 meses</SelectItem>
            <SelectItem value="currentYear">Año presente</SelectItem>
            <SelectItem value="lastYear">Año pasado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts - moved to top */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Proyección Financiera</CardTitle>
          </CardHeader>
          <CardContent style={{ height: '400px' }}>
            <ChartContainer
              config={{
                ingresos: { label: "Ingresos", color: "#4169E1" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrencyValue} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => [formatCurrencyValue(value), 'Ingresos']}
                  />
                  <Bar 
                    dataKey="ingresos" 
                    fill="#4169E1" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Eventos por Estado</CardTitle>
          </CardHeader>
          <CardContent style={{ height: '400px' }}>
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
                    outerRadius={120}
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

      {/* Financial Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Eventos Pagados</p>
              <p className="text-2xl font-bold text-green-600">
                {dataService.formatCurrency(paidTotal, defaultCurrency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Eventos Pendientes</p>
              <p className="text-2xl font-bold text-amber-600">
                {dataService.formatCurrency(pendingTotal, defaultCurrency)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              En el período seleccionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dataService.formatCurrency(stats.totalRevenue, defaultCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagos recibidos del período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Pagados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidEvents}</div>
            <p className="text-xs text-muted-foreground">
              Completados y pagados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Pendientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Prospectos por confirmar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Estados de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-sm font-medium text-yellow-800">Prospectos</div>
              <div className="text-2xl font-bold text-yellow-900">
                {eventStatusData.find(d => d.name === 'Prospecto')?.value || 0}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800">Confirmados</div>
              <div className="text-2xl font-bold text-blue-900">
                {eventStatusData.find(d => d.name === 'Confirmado')?.value || 0}
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-sm font-medium text-orange-800">Servicio Brindado</div>
              <div className="text-2xl font-bold text-orange-900">
                {eventStatusData.find(d => d.name === 'Servicio Brindado')?.value || 0}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-800">Pagados</div>
              <div className="text-2xl font-bold text-green-900">
                {eventStatusData.find(d => d.name === 'Pagado')?.value || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
