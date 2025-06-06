
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, CreditCard, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SubscriptionStatus {
  status: 'trial' | 'active' | 'pending_payment' | 'inactive';
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

const SubscriptionSettings = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    status: 'trial',
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const checkSubscriptionStatus = async () => {
    if (!currentUser) return;

    try {
      setCheckingStatus(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "No se pudo verificar el estado de la suscripción",
        variant: "destructive",
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();
  }, [currentUser]);

  const handleSubscribe = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la sesión de pago",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "No se pudo abrir el portal de gestión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending_payment':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'trial':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'pending_payment':
        return 'Pendiente de Pago';
      case 'trial':
        return 'Prueba Gratuita';
      default:
        return 'Inactiva';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default' as const;
      case 'pending_payment':
        return 'destructive' as const;
      case 'trial':
        return 'secondary' as const;
      default:
        return 'destructive' as const;
    }
  };

  if (checkingStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Estado de Suscripción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verificando estado de suscripción...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Estado de Suscripción
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(subscription.status)}
              <div>
                <p className="font-medium">Estado de la Cuenta</p>
                <p className="text-sm text-gray-600">
                  {subscription.subscription_tier ? `Plan ${subscription.subscription_tier}` : 'Sin plan activo'}
                </p>
              </div>
            </div>
            <Badge variant={getStatusVariant(subscription.status)}>
              {getStatusLabel(subscription.status)}
            </Badge>
          </div>

          {subscription.subscription_end && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Próxima renovación:</strong> {new Date(subscription.subscription_end).toLocaleDateString('es-ES')}
              </p>
            </div>
          )}

          {subscription.status === 'trial' && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                Estás en periodo de prueba gratuita. Suscríbete para acceder a todas las funcionalidades.
              </p>
            </div>
          )}

          {subscription.status === 'pending_payment' && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-800">
                Hay un problema con tu pago. Por favor, actualiza tu método de pago.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan Premium</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Funcionalidades incluidas:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Gestión ilimitada de clientes y eventos</li>
              <li>• Envío de propuestas por email</li>
              <li>• Historial completo de propuestas</li>
              <li>• Configuración avanzada de email</li>
              <li>• Filtros avanzados en el dashboard</li>
              <li>• Soporte prioritario</li>
            </ul>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-lg">$29.99 USD</p>
                <p className="text-sm text-gray-600">por mes</p>
              </div>
              
              <div className="flex gap-2">
                {!subscription.subscribed ? (
                  <Button 
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {loading ? 'Procesando...' : 'Suscribirse'}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleManageSubscription}
                    disabled={loading}
                    variant="outline"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {loading ? 'Abriendo...' : 'Gestionar Suscripción'}
                  </Button>
                )}
                
                <Button 
                  onClick={checkSubscriptionStatus}
                  variant="outline"
                  size="sm"
                >
                  Actualizar Estado
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSettings;
