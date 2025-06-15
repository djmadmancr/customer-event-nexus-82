
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardDateFiltersProps {
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (dateRange: { from?: Date; to?: Date }) => void;
}

const DashboardDateFilters: React.FC<DashboardDateFiltersProps> = ({
  dateRange,
  onDateRangeChange
}) => {
  const { t } = useLanguage();

  const handleFromDateChange = (date: Date | undefined) => {
    onDateRangeChange({ ...dateRange, from: date });
  };

  const handleToDateChange = (date: Date | undefined) => {
    onDateRangeChange({ ...dateRange, to: date });
  };

  const handleClearFilters = () => {
    onDateRangeChange({});
  };

  return (
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
                  onSelect={handleFromDateChange}
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
                  onSelect={handleToDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            className="text-sm"
          >
            {t('clear_filters')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardDateFilters;
