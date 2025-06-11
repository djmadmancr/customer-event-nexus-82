
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, CalendarIcon, User } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

const Home = () => {
  const { events, customers } = useCrm();
  const { defaultCurrency } = useAppConfig();
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  
  // Apply date filter to events
  useEffect(() => {
    let filtered = [...events];

    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        if (dateRange.from && eventDate < dateRange.from) return false;
        if (dateRange.to && eventDate > dateRange.to) return false;
        return true;
      });
    }

    setFilteredEvents(filtered);
  }, [events, dateRange]);

  // Count events by status using filtered events
  const pendingEvents = filteredEvents.filter(event => event.status === 'prospect').length;
  const confirmedEvents = filteredEvents.filter(event => event.status === 'confirmed').length;
  const paidEvents = filteredEvents.filter(event => event.status === 'paid').length;
  const completedEvents = filteredEvents.filter(event => event.status === 'show_completed').length;

  // Top 5 customers by revenue
  const topCustomers = customers
    .map(customer => {
      const customerEvents = filteredEvents.filter(e => e.customerId === customer.id && e.status === 'paid');
      const revenue = customerEvents.reduce((sum, event) => sum + (event.totalWithTax || event.cost), 0);
      return { name: customer.name, revenue, eventCount: customerEvents.length };
    })
    .filter(customer => customer.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Event category distribution
  const categoryData = [
    { name: 'Bodas', value: filteredEvents.filter(e => e.category === 'wedding').length, color: '#7C3AED' },
    { name: 'Cumpleaños', value: filteredEvents.filter(e => e.category === 'birthday').length, color: '#A855F7' },
    { name: 'Corporativos', value: filteredEvents.filter(e => e.category === 'corporate').length, color: '#6366F1' },
    { name: 'Club', value: filteredEvents.filter(e => e.category === 'club').length, color: '#8B5CF6' },
    { name: 'Otros', value: filteredEvents.filter(e => e.category === 'other' || !e.category).length, color: '#9333EA' },
  ].filter(category => category.value > 0);

  // Format number without currency symbol
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate monthly data for revenue comparison
  useEffect(() => {
    const monthlyRevenue: { [key: string]: { scheduled: number; collected: number } } = {};
    
    // Determine date range for complete months
    const startDate = dateRange.from || new Date(new Date().getFullYear() - 1, 0, 1);
    const endDate = dateRange.to || new Date();
    
    // Generate all complete months in the range
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (current <= endDate) {
      const monthKey = current.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      monthlyRevenue[monthKey] = { scheduled: 0, collected: 0 };
      current.setMonth(current.getMonth() + 1);
    }

    filteredEvents.forEach(event => {
      const eventDate = new Date(event.date);
      const monthKey = eventDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      
      if (monthlyRevenue.hasOwnProperty(monthKey)) {
        const eventTotal = event.totalWithTax || event.cost;
        // All events are considered scheduled
        monthlyRevenue[monthKey].scheduled += eventTotal;
        
        // Only paid events are considered collected
        if (event.status === 'paid') {
          monthlyRevenue[monthKey].collected += eventTotal;
        }
      }
    });

    const chartData = Object.entries(monthlyRevenue).map(([month, data]) => ({
      month,
      programados: data.scheduled,
      cobrados: data.collected,
    }));

    setMonthlyData(chartData);
  }, [filteredEvents, dateRange]);

  // Horizontal bar chart data (top customers)
  const horizontalBarData = topCustomers.map((customer, index) => ({
    name: customer.name,
    revenue: customer.revenue,
    rank: index + 1
  }));
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Filtro de Fechas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Desde:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "dd/MM/yyyy") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Hasta:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setDateRange({})}
              className="text-sm"
            >
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Event Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Resumen de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-purple-100 rounded-md">
              <div className="text-sm font-medium">Cotización</div>
              <div className="text-2xl font-bold">{pendingEvents}</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-md">
              <div className="text-sm font-medium">Confirmados</div>
              <div className="text-2xl font-bold">{confirmedEvents}</div>
            </div>
            <div className="p-3 bg-indigo-100 rounded-md">
              <div className="text-sm font-medium">Show Realizado</div>
              <div className="text-2xl font-bold">{completedEvents}</div>
            </div>
            <div className="p-3 bg-purple-200 rounded-md">
              <div className="text-sm font-medium">Pagados</div>
              <div className="text-2xl font-bold">{paidEvents}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Revenue Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base">Ingresos Mensuales - Programados vs Cobrados ({defaultCurrency})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tickMargin={5}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatNumber(value), 
                    name === 'programados' ? 'Programados' : 'Cobrados'
                  ]}
                />
                <Bar dataKey="programados" fill="#A855F7" name="programados" />
                <Bar dataKey="cobrados" fill="#7C3AED" name="cobrados" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base">Distribución por Categoría de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    fontSize={10}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">
                No hay eventos categorizados
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Horizontal Bar Chart and Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top Customers Horizontal Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base">Top 5 Clientes por Ingresos - Gráfico de Barras</CardTitle>
          </CardHeader>
          <CardContent>
            {horizontalBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={horizontalBarData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    fontSize={10}
                    width={100}
                    tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatNumber(value), 'Ingresos']}
                  />
                  <Bar dataKey="revenue" fill="#6E59A5" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">
                No hay datos de ingresos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Customers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm md:text-base">
              <User className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Top 5 Clientes por Ingresos ({defaultCurrency})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomers.length > 0 ? (
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-crm-primary text-white rounded-full text-xs md:text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm md:text-base">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.eventCount} evento(s)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-sm md:text-base">
                        {formatNumber(customer.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">
                No hay datos de ingresos disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
