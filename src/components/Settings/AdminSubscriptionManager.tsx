
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Users, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SubscriberData {
  id: string;
  user_id: string;
  email: string;
  stripe_customer_id: string | null;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

const AdminSubscriptionManager = () => {
  const [subscribers, setSubscribers] = useState<SubscriberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const { adminUpdateSubscription } = useAuth();

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading subscribers:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los suscriptores",
          variant: "destructive",
        });
        return;
      }

      setSubscribers(data || []);
    } catch (error) {
      console.error('Error in loadSubscribers:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!searchEmail || !newStatus) {
      toast({
        title: "Error",
        description: "Email y estado son requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(true);
      await adminUpdateSubscription(searchEmail, newStatus, newEndDate || undefined);
      
      // Reload subscribers after update
      await loadSubscribers();
      
      // Clear form
      setSearchEmail('');
      setNewStatus('');
      setNewEndDate('');
      
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar suscripción",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'grace':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'inactive':
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Activa</Badge>;
      case 'grace':
        return <Badge className="bg-blue-100 text-blue-800">Gracia</Badge>;
      case 'inactive':
      default:
        return <Badge className="bg-red-100 text-red-800">Inactiva</Badge>;
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando suscriptores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Update Subscription Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actualizar Suscripción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email del Usuario</Label>
              <Input
                id="email"
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Nuevo Estado</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="grace">Período de Gracia</SelectItem>
                  <SelectItem value="inactive">Inactiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="endDate">Fecha de Vencimiento (opcional)</Label>
              <Input
                id="endDate"
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Dejar vacío para usar la fecha actual + 1 mes
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleUpdateSubscription}
            disabled={updating || !searchEmail || !newStatus}
            className="w-full bg-crm-primary hover:bg-crm-primary/90"
          >
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Actualizar Suscripción
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Subscribers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Suscriptores ({subscribers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscribers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay suscriptores registrados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Plan</th>
                      <th className="text-left p-2">Vencimiento</th>
                      <th className="text-left p-2">Actualizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono text-xs">{subscriber.email}</td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(subscriber.subscription_status)}
                            {getStatusBadge(subscriber.subscription_status)}
                          </div>
                        </td>
                        <td className="p-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {subscriber.subscription_tier || 'N/A'}
                          </span>
                        </td>
                        <td className="p-2">
                          {subscriber.subscription_end ? (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-xs">
                                {format(new Date(subscriber.subscription_end), 'dd/MM/yyyy', { locale: es })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="p-2 text-xs text-gray-500">
                          {format(new Date(subscriber.updated_at), 'dd/MM/yy HH:mm', { locale: es })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button 
              onClick={loadSubscribers}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Actualizar Lista'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptionManager;
