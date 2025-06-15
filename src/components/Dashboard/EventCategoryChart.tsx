
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface EventCategoryChartProps {
  categoryData: Array<{ name: string; value: number; color: string }>;
}

const EventCategoryChart: React.FC<EventCategoryChartProps> = ({ categoryData }) => {
  const { t } = useLanguage();

  // Function to translate category names
  const translateCategory = (categoryName: string) => {
    const categoryMap: { [key: string]: string } = {
      'wedding': t('wedding'),
      'birthday': t('birthday'),
      'corporate': t('corporate'),
      'club': t('club'),
      'other': t('other'),
      'uncategorized': t('uncategorized')
    };
    
    return categoryMap[categoryName.toLowerCase()] || categoryName;
  };

  // Transform data to include translated names
  const translatedCategoryData = categoryData.map(item => ({
    ...item,
    translatedName: translateCategory(item.name),
    name: item.name // Keep original for data key
  }));

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
                data={translatedCategoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                fontSize={10}
              >
                {translatedCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  value,
                  props.payload.translatedName
                ]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => {
                  const item = translatedCategoryData.find(d => d.name === entry.payload.name);
                  return item ? item.translatedName : value;
                }}
              />
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
