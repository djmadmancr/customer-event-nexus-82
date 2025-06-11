
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';

const Home = () => {
  const { events } = useCrm();
  
  // Count events by status
  const pendingEvents = events.filter(event => event.status === 'prospect').length;
  const confirmedEvents = events.filter(event => event.status === 'confirmed').length;
  const paidEvents = events.filter(event => event.status === 'paid').length;
  const completedEvents = events.filter(event => event.status === 'show_completed').length;
  
  return (
    <div className="space-y-6">
      {/* Event Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Resumen de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-purple-100 rounded-md">
              <div className="text-sm font-medium">Cotización</div>
              <div className="text-2xl font-bold">{pendingEvents}</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-md">
              <div className="text-sm font-medium">Confirmados</div>
              <div className="text-2xl font-bold">{confirmedEvents}</div>
            </div>
            <div className="p-3 bg-indigo-100 rounded-md">
              <div className="text-sm font-medium">Show Realizado</div>
              <div className="text-2xl font-bold">{completedEvents}</div>
            </div>
            <div className="p-3 bg-purple-200 rounded-md">
              <div className="text-sm font-medium">Pagados</div>
              <div className="text-2xl font-bold">{paidEvents}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
