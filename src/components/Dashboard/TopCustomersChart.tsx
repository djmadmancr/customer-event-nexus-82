
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface TopCustomersChartProps {
  horizontalBarData: Array<{ name: string; revenue: number; rank: number }>;
}

const TopCustomersChart: React.FC<TopCustomersChartProps> = ({ horizontalBarData }) => {
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
  );
};

export default TopCustomersChart;
