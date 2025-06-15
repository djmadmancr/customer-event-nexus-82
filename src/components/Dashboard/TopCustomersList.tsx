
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface TopCustomersListProps {
  topCustomers: Array<{ name: string; revenue: number; eventCount: number }>;
}

const TopCustomersList: React.FC<TopCustomersListProps> = ({ topCustomers }) => {
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
  );
};

export default TopCustomersList;
