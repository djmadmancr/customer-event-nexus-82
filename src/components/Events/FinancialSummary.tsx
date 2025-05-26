
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import dataService from '@/services/DataService';
import { useAppConfig } from '@/contexts/AppConfigContext';

const FinancialSummary: React.FC = () => {
  const { defaultCurrency } = useAppConfig();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [paidTotal, setPaidTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);

  useEffect(() => {
    const calculateTotals = () => {
      const paid = dataService.getEventsTotalByStatusAndDateRange('paid', startDate, endDate);
      setPaidTotal(paid);

      // For pending, we need to sum prospect, confirmed and delivered events
      const prospect = dataService.getEventsTotalByStatusAndDateRange('prospect', startDate, endDate);
      const confirmed = dataService.getEventsTotalByStatusAndDateRange('confirmed', startDate, endDate);
      const delivered = dataService.getEventsTotalByStatusAndDateRange('delivered', startDate, endDate);
      setPendingTotal(prospect + confirmed + delivered);
    };

    calculateTotals();
  }, [startDate, endDate]);

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Resumen Financiero</h3>
            <div className="grid grid-cols-2 gap-6 mt-2">
              <div>
                <p className="text-sm text-gray-500">Eventos Pagados</p>
                <p className="text-2xl font-bold text-green-600">
                  {dataService.formatCurrency(paidTotal, defaultCurrency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Eventos Pendientes</p>
                <p className="text-2xl font-bold text-amber-600">
                  {dataService.formatCurrency(pendingTotal, defaultCurrency)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Fecha inicio</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[160px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    {startDate ? (
                      format(startDate, "dd/MM/yyyy", { locale: es })
                    ) : (
                      <span>Seleccionar</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={es}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">Fecha fin</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[160px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    {endDate ? (
                      format(endDate, "dd/MM/yyyy", { locale: es })
                    ) : (
                      <span>Seleccionar</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    locale={es}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummary;
