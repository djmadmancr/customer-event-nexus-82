
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface EventCategoryChartProps {
  categoryData: Array<{ name: string; value: number; color: string }>;
}

const EventCategoryChart: React.FC<EventCategoryChartProps> = ({ categoryData }) => {
  const { t } = useLanguage();

  return (
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
  );
};

export default EventCategoryChart;
