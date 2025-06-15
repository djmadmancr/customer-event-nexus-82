import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, Calendar, Coins, TrendingUp, User, CalendarIcon } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import dataService from '@/services/DataService';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const { customers, events } = useCrm();
  const { defaultCurrency } = useAppConfig();
  const { t } = useLanguage();
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

  // Calculate stats based on filtered events
  const totalCustomers = customers.length;
  const totalEvents = filteredEvents.length;
  const upcomingEvents = filteredEvents.filter(event => 
    event.date >= new Date() && 
    event.date <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length;
  
  const totalRevenue = filteredEvents
    .filter(event => event.status === 'paid')
    .reduce((sum, event) => sum + (event.totalWithTax || event.cost), 0);

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
    { name: t('wedding'), value: filteredEvents.filter(e => e.category === 'wedding').length, color: '#7C3AED' },
    { name: t('birthday'), value: filteredEvents.filter(e => e.category === 'birthday').length, color: '#A855F7' },
    { name: t('corporate'), value: filteredEvents.filter(e => e.category === 'corporate').length, color: '#6366F1' },
    { name: t('club'), value: filteredEvents.filter(e => e.category === 'club').length, color: '#8B5CF6' },
    { name: t('other'), value: filteredEvents.filter(e => e.category === 'other' || !e.category).length, color: '#9333EA' },
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
          <CardTitle className="text-sm md:text-base">{t('date_filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">{t('from')}:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "dd/MM/yyyy") : t('select_date')}
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
              <label className="text-sm font-medium">{t('to')}:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : t('select_date')}
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
              {t('clear_filters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">{t('total_customers')}</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">{t('total_events')}</CardTitle>
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">{t('upcoming_events')}</CardTitle>
            <CalendarDays className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{upcomingEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">{t('total_revenue')} ({defaultCurrency})</CardTitle>
            <Coins className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">
              {formatNumber(totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Revenue Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base">{t('monthly_revenue')} ({defaultCurrency})</CardTitle>
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
                    name === 'programados' ? t('programados') : t('cobrados')
                  ]}
                />
                <Legend 
                  formatter={(value) => value === 'programados' ? t('programados') : t('cobrados')}
                  verticalAlign="bottom" 
                  height={36} 
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
            <CardTitle className="text-sm md:text-base">{t('event_categories')}</CardTitle>
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
                    label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                    fontSize={10}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">
                {t('no_categorized_events')}
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
            <CardTitle className="text-sm md:text-base">{t('top_clients')} - {t('revenue')}</CardTitle>
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
                    formatter={(value: number) => [formatNumber(value), t('revenue')]}
                  />
                  <Bar dataKey="revenue" fill="#6E59A5" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">
                {t('no_revenue_data')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Customers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm md:text-base">
              <User className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              {t('top_clients')} ({defaultCurrency})
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
                        <p className="text-xs text-gray-500">{customer.eventCount} {t('event')}{customer.eventCount !== 1 ? 's' : ''}</p>
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
                {t('no_revenue_data')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
