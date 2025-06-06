
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  status: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

const SubscriptionSettings = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        console.log('No session found');
        return;
      }

      console.log('Checking subscription status...');
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        toast({
          title: "Error",
          description: "No se pudo verificar el estado de la suscripción",
          variant: "destructive",
        });
        return;
      }

      console.log('Subscription data received:', data);
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error in checkSubscription:', error);
      toast({
        title: "Error",
        description: "Error al verificar la suscripción",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setCheckoutLoading(true);
      console.log('Creating checkout session...');
      
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para suscribirte",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout:', error);
        toast({
          title: "Error",
          description: "No se pudo crear la sesión de pago",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        console.log('Redirecting to checkout:', data.url);
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirigiendo a Stripe",
          description: "Se abrirá una nueva ventana para completar el pago",
        });
      }
    } catch (error) {
      console.error('Error in handleSubscribe:', error);
      toast({
        title: "Error",
        description: "Error al procesar la suscripción",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para gestionar tu suscripción",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        console.error('Error accessing customer portal:', error);
        toast({
          title: "Error",
          description: "No se pudo acceder al portal del cliente",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error in handleManageSubscription:', error);
      toast({
        title: "Error",
        description: "Error al acceder al portal de gestión",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();

    // Auto-refresh every 30 seconds
    const interval = setInterval(checkSubscription, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'trial':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'pending_payment':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'inactive':
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Activa</Badge>;
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'pending_payment':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente de Pago</Badge>;
      case 'inactive':
      default:
        return <Badge className="bg-red-100 text-red-800">Inactiva</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Estado de Suscripción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Verificando estado de suscripción...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Estado de Suscripción
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscriptionData ? (
          <>
            {/* Status Overview */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(subscriptionData.status)}
                <div>
                  <h3 className="font-semibold">Estado de la Cuenta</h3>
                  <p className="text-sm text-gray-600">
                    {subscriptionData.subscription_tier || 'Sin suscripción'}
                  </p>
                </div>
              </div>
              {getStatusBadge(subscriptionData.status)}
            </div>

            {/* Subscription Details */}
            {subscriptionData.subscribed && subscriptionData.subscription_end && (
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Renovación: {new Date(subscriptionData.subscription_end).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {!subscriptionData.subscribed ? (
                <Button 
                  onClick={handleSubscribe}
                  disabled={checkoutLoading}
                  className="w-full bg-crm-primary hover:bg-crm-primary/90"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Suscribirse - $7.99/mes
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  variant="outline"
                  className="w-full"
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Gestionar Suscripción
                    </>
                  )}
                </Button>
              )}

              <Button 
                onClick={checkSubscription}
                variant="ghost"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Actualizar Estado'
                )}
              </Button>
            </div>

            {/* Plan Information */}
            <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Plan Premium - $7.99/mes</h4>
              <ul className="space-y-1">
                <li>• Acceso completo a todas las funcionalidades</li>
                <li>• Gestión ilimitada de clientes y eventos</li>
                <li>• Reportes y análisis avanzados</li>
                <li>• Soporte prioritario</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="space-y-4">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <div>
                <h3 className="font-semibold">Sin Suscripción Activa</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Suscríbete para acceder a todas las funcionalidades premium
                </p>
              </div>
              <Button 
                onClick={handleSubscribe}
                disabled={checkoutLoading}
                className="bg-crm-primary hover:bg-crm-primary/90"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Suscribirse - $7.99/mes
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionSettings;
