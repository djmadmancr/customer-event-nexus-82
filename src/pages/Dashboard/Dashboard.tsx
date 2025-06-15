
import React, { useState, useEffect } from 'react';
import { useCrm } from '@/contexts/CrmContext';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import DashboardDateFilters from '@/components/Dashboard/DashboardDateFilters';
import MonthlyRevenueChart from '@/components/Dashboard/MonthlyRevenueChart';
import EventCategoryChart from '@/components/Dashboard/EventCategoryChart';
import TopCustomersList from '@/components/Dashboard/TopCustomersList';
import { useLanguage } from '@/contexts/LanguageContext';

const Dashboard = () => {
  const { customers, events } = useCrm();
  const { t } = useLanguage();
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  // Debug log to verify single Dashboard render
  console.log('Dashboard rendered ONCE - customers:', customers.length, 'events:', events.length);

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

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Date Range Filter */}
      <DashboardDateFilters 
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Stats Cards */}
      <DashboardStats
        totalCustomers={totalCustomers}
        totalEvents={totalEvents}
        upcomingEvents={upcomingEvents}
        totalRevenue={totalRevenue}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <MonthlyRevenueChart monthlyData={monthlyData} />
        <EventCategoryChart categoryData={categoryData} />
      </div>

      {/* ÚNICA Lista de Clientes Principales */}
      <TopCustomersList topCustomers={topCustomers} />
    </div>
  );
};

export default Dashboard;
