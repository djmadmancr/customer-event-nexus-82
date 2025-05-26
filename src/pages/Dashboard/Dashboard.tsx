
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, TrendingUp, DollarSign, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCrm } from '@/contexts/CrmContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import dataService from '@/services/DataService';

type DateFilter = 'last3months' | 'next3months' | 'currentYear' | 'lastYear';

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

  // Financial summary state
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [paidTotal, setPaidTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);

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

  const filterEventsByDateRange = (events: any[], dateRange: { start: Date; end: Date }) => {
    return events.filter(event => 
      event.date >= dateRange.start && event.date <= dateRange.end
    );
  };

  useEffect(() => {
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

    // Calculate stats
    const totalRevenue = monthlyData.reduce((sum, month) => sum + month.ingresos, 0);
    const paidEvents = filteredEvents.filter(e => e.status === 'paid').length;
    const pendingEvents = filteredEvents.filter(e => e.status === 'prospect').length;

    setStats({
      totalEvents: filteredEvents.length,
      totalRevenue,
      paidEvents,
      pendingEvents
    });

  }, [events, dateFilter]);

  // Financial summary calculations
  useEffect(() => {
    const calculateTotals = () => {
      const paid = dataService.getEventsTotalByStatusAndDateRange('paid', startDate, endDate);
      setPaidTotal(paid);

      // For pending, we need to sum prospect, confirmed and delivered events
      const prospect = dataService.getEventsTotalByStatusAndDateRange('prospect', startDate, endDate);
      const confirmed = dataService.getEventsTotalByStatusAndDateRange('confirmed', startDate, endDate);
      const delivered = dataService.getEventsTotalByStatusAndDateRange('delivered', startDate, endDate);
      setPendingTotal(prospect + confirmed + delivered);
    };

    calculateTotals();
  }, [startDate, endDate]);

  const COLORS = ['#FFD700', '#4169E1', '#FFA500', '#32CD32'];

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
            <SelectItem value="last3months">Últimos 3 meses</SelectItem>
            <SelectItem value="next3months">Próximos 3 meses</SelectItem>
            <SelectItem value="currentYear">Año presente</SelectItem>
            <SelectItem value="lastYear">Año pasado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Financial Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="grid grid-cols-2 gap-6 mt-2">
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
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Fecha inicio</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[160px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate ? (
                        format(startDate, "dd/MM/yyyy", { locale: es })
                      ) : (
                        <span>Seleccionar</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      locale={es}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Fecha fin</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[160px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate ? (
                        format(endDate, "dd/MM/yyyy", { locale: es })
                      ) : (
                        <span>Seleccionar</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      locale={es}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
              Proyección del período
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

      {/* Charts */}
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
                <LineChart data={monthlyRevenue}>
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => dataService.formatCurrency(value, defaultCurrency)} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => [dataService.formatCurrency(value, defaultCurrency), 'Ingresos']}
                  />
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
