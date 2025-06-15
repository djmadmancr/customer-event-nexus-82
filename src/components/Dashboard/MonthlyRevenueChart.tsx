
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface MonthlyRevenueChartProps {
  monthlyData: any[];
}

const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ monthlyData }) => {
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
  );
};

export default MonthlyRevenueChart;
