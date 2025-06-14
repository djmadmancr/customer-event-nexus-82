
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, Calendar, Coins, TrendingUp, User } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import dataService from '@/services/DataService';
import DashboardFilters from '@/components/Dashboard/DashboardFilters';

const Dashboard = () => {
  const { customers, events } = useCrm();
  const { defaultCurrency } = useAppConfig();
  const { t } = useLanguage();
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [filters, setFilters] = useState<any>({});

  // Apply filters to events
  useEffect(() => {
    let filtered = [...events];

    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        if (filters.dateRange.from && eventDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && eventDate > filters.dateRange.to) return false;
        return true;
      });
    }

    if (filters.status) {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      filtered = filtered.filter(event => {
        if (filters.minAmount !== undefined && event.cost < filters.minAmount) return false;
        if (filters.maxAmount !== undefined && event.cost > filters.maxAmount) return false;
        return true;
      });
    }

    setFilteredEvents(filtered);
  }, [events, filters]);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  // Calculate stats based on filtered events
  const totalCustomers = customers.length;
  const totalEvents = filteredEvents.length;
  const upcomingEvents = filteredEvents.filter(event => 
    event.date >= new Date() && 
    event.date <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length;
  
  const totalRevenue = filteredEvents
    .filter(event => event.status === 'paid')
    .reduce((sum, event) => sum + event.cost, 0);

  // Event status distribution with updated colors that match the app theme
  const statusData = [
    { name: t('prospects'), value: filteredEvents.filter(e => e.status === 'prospect').length, color: '#A855F7' },
    { name: t('confirmed'), value: filteredEvents.filter(e => e.status === 'confirmed').length, color: '#6366F1' },
    { name: t('show_completed'), value: filteredEvents.filter(e => e.status === 'show_completed').length, color: '#8B5CF6' },
    { name: t('paid'), value: filteredEvents.filter(e => e.status === 'paid').length, color: '#7C3AED' },
  ];

  // Top 5 customers by revenue (as a list instead of chart)
  const topCustomers = customers
    .map(customer => {
      const customerEvents = filteredEvents.filter(e => e.customerId === customer.id && e.status === 'paid');
      const revenue = customerEvents.reduce((sum, event) => sum + event.cost, 0);
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

  // Conversion funnel data
  const totalProspects = events.filter(e => e.status === 'prospect').length;
  const totalConfirmed = events.filter(e => e.status === 'confirmed').length;
  const totalCompleted = events.filter(e => e.status === 'show_completed').length;
  const totalPaid = events.filter(e => e.status === 'paid').length;

  const funnelData = [
    { name: t('prospects'), value: totalProspects, fill: '#A855F7' },
    { name: t('confirmed'), value: totalConfirmed, fill: '#6366F1' },
    { name: t('show_completed'), value: totalCompleted, fill: '#8B5CF6' },
    { name: t('paid'), value: totalPaid, fill: '#7C3AED' },
  ];

  // Format number without currency symbol
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    // Calculate monthly data for the complete months
    const monthlyRevenue: { [key: string]: number } = {};
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Get data for the last 12 complete months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentDate.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      monthlyRevenue[monthKey] = 0;
    }

    filteredEvents.forEach(event => {
      if (event.status === 'paid') {
        const eventDate = new Date(event.date);
        const monthKey = eventDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
        if (monthlyRevenue.hasOwnProperty(monthKey)) {
          monthlyRevenue[monthKey] += event.cost;
        }
      }
    });

    const chartData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    setMonthlyData(chartData);
  }, [filteredEvents]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Dashboard Filters */}
      <DashboardFilters 
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">{t('total_customers')}</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +{customers.filter(c => {
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return c.createdAt >= weekAgo;
              }).length} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">{t('total_events')}</CardTitle>
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {filters.dateRange?.from || filters.dateRange?.to || filters.status || filters.minAmount || filters.maxAmount
                ? 'Filtrados'
                : `+${events.filter(e => {
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return e.createdAt >= weekAgo;
                  }).length} esta semana`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">{t('upcoming_events')}</CardTitle>
            <CalendarDays className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              En los próximos 30 días
            </p>
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
            <p className="text-xs text-muted-foreground">
              Eventos pagados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base">{t('monthly_revenue')} ({defaultCurrency})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tickMargin={5}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value: number) => [
                    formatNumber(value), 
                    t('revenue')
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
            <CardTitle className="text-sm md:text-base">{t('event_status')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  fontSize={10}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* New Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top 5 Customers by Revenue - Mobile friendly list */}
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

        {/* Event Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base">{t('event_distribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
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
              <div className="flex items-center justify-center h-[250px] text-gray-500 text-sm">
                {t('no_categorized_events')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm md:text-base">
            <TrendingUp className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            {t('prospects_conversion')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                tickMargin={5}
              />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#6E59A5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
