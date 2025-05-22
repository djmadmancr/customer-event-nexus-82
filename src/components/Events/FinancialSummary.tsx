
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import dataService from '@/services/DataService';

type DateFilter = 'current-month' | 'last-3-months' | 'last-year' | 'all';

const FinancialSummary: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<DateFilter>('current-month');
  const [paidTotal, setPaidTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);

  useEffect(() => {
    const calculateTotals = () => {
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      const now = new Date();
      endDate = now;

      if (dateFilter === 'current-month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (dateFilter === 'last-3-months') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      } else if (dateFilter === 'last-year') {
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      } else {
        // 'all' - no date restrictions
        startDate = undefined;
        endDate = undefined;
      }

      const paid = dataService.getEventsTotalByStatusAndDateRange('paid', startDate, endDate);
      setPaidTotal(paid);

      // For pending, we need to sum prospect, confirmed and delivered events
      const prospect = dataService.getEventsTotalByStatusAndDateRange('prospect', startDate, endDate);
      const confirmed = dataService.getEventsTotalByStatusAndDateRange('confirmed', startDate, endDate);
      const delivered = dataService.getEventsTotalByStatusAndDateRange('delivered', startDate, endDate);
      setPendingTotal(prospect + confirmed + delivered);
    };

    calculateTotals();
  }, [dateFilter]);

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
                  ${paidTotal.toLocaleString('es-MX')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Eventos Pendientes</p>
                <p className="text-2xl font-bold text-amber-600">
                  ${pendingTotal.toLocaleString('es-MX')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="w-full sm:w-auto">
            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Mes presente</SelectItem>
                <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
                <SelectItem value="last-year">Último año</SelectItem>
                <SelectItem value="all">Todos los registrados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummary;
