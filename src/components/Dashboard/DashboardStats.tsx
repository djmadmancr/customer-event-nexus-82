
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, Calendar, Coins } from 'lucide-react';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardStatsProps {
  totalCustomers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalRevenue: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalCustomers,
  totalEvents,
  upcomingEvents,
  totalRevenue
}) => {
  const { defaultCurrency } = useAppConfig();
  const { t } = useLanguage();

  // Format number without currency symbol
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
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
  );
};

export default DashboardStats;
