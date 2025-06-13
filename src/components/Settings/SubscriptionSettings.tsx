
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SubscriptionData {
  status: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

const SubscriptionSettings = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser, userData, checkSubscriptionStatus } = useAuth();

  const checkSubscription = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!currentUser || !userData) {
        console.log('No current user found');
        setSubscriptionData({
          status: 'inactive',
          subscribed: false,
          subscription_tier: null,
          subscription_end: null
        });
        return;
      }

      // For local users with subscription data, use that directly
      if (userData.subscriptionExpiry) {
        const status = checkSubscriptionStatus(userData);
        const isActive = status === 'active';
        const isGrace = status === 'grace';
        
        setSubscriptionData({
          status: isActive ? 'active' : isGrace ? 'trial' : 'inactive',
          subscribed: isActive || isGrace,
          subscription_tier: isActive || isGrace ? 'premium' : null,
          subscription_end: userData.subscriptionExpiry.toISOString(),
        });
        return;
      }

      // For users without local subscription data, try Supabase
      // Get fresh session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setSubscriptionData({
          status: 'inactive',
          subscribed: false,
          subscription_tier: null,
          subscription_end: null
        });
        return;
      }

      if (!sessionData?.session) {
        console.log('No session found');
        setSubscriptionData({
          status: 'inactive',
          subscribed: false,
          subscription_tier: null,
          subscription_end: null
        });
        return;
      }

      console.log('Checking subscription status with valid session...');
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        // Fallback to local subscription data
        setSubscriptionData({
          status: 'inactive',
          subscribed: false,
          subscription_tier: null,
          subscription_end: null
        });
        return;
      }

      console.log('Subscription data received:', data);
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error in checkSubscription:', error);
      setSubscriptionData({
        status: 'inactive',
        subscribed: false,
        subscription_tier: null,
        subscription_end: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (!currentUser) {
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para suscribirte.",
        variant: "destructive",
      });
      return;
    }

    // Direct redirect to Stripe payment link
    window.open('https://buy.stripe.com/8x228t40WeTS7E7dAKcAo01', '_blank');
    
    toast({
      title: "Redirigiendo a Stripe",
      description: "Serás redirigido a la página de pago segura de Stripe",
    });
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      
      if (!currentUser) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para gestionar tu suscripción",
          variant: "destructive",
        });
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session) {
        toast({
          title: "Error",
          description: "Tu sesión ha expirado. Por favor, cierra sesión y vuelve a iniciar.",
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
        window.location.href = data.url;
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
  }, [currentUser, userData]);

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
        return <Badge className="bg-blue-100 text-blue-800">Período de Gracia</Badge>;
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
                  <span>
                    {subscriptionData.status === 'trial' ? 'Vence: ' : 'Renovación: '}
                    {format(new Date(subscriptionData.subscription_end), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
                {subscriptionData.status === 'trial' && (
                  <p className="text-sm text-orange-600">
                    Tu suscripción ha expirado. Tienes acceso limitado por 2 semanas más.
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {!subscriptionData.subscribed || subscriptionData.status === 'inactive' ? (
                <Button 
                  onClick={handleSubscribe}
                  className="w-full bg-crm-primary hover:bg-crm-primary/90"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Suscribirse - $7.99/mes
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
                className="bg-crm-primary hover:bg-crm-primary/90"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Suscribirse - $7.99/mes
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionSettings;
