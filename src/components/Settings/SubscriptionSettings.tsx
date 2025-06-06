
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  XCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type SubscriptionStatus = 'active' | 'trial' | 'pending' | 'inactive';

interface SubscriptionData {
  status: SubscriptionStatus;
  plan: string;
  nextBilling?: Date;
  trialEnds?: Date;
  amount: number;
}

const SubscriptionSettings = () => {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    status: 'trial',
    plan: 'Premium',
    trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    amount: 29.99
  });
  const [isLoading, setIsLoading] = useState(false);

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Activa
          </Badge>
        );
      case 'trial':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="h-3 w-3 mr-1" />
            Prueba Gratuita
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pendiente de Pago
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Inactiva
          </Badge>
        );
    }
  };

  const getStatusAlert = () => {
    switch (subscription.status) {
      case 'active':
        return (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Tu suscripción está activa. Próximo pago el{' '}
              {subscription.nextBilling?.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </AlertDescription>
          </Alert>
        );
      case 'trial':
        return (
          <Alert className="border-blue-500 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Tienes {Math.ceil((subscription.trialEnds!.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días restantes de prueba gratuita.
              Actualiza tu plan para continuar usando todas las funciones.
            </AlertDescription>
          </Alert>
        );
      case 'pending':
        return (
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Tu pago está pendiente. Actualiza tu método de pago para reactivar tu suscripción.
            </AlertDescription>
          </Alert>
        );
      case 'inactive':
        return (
          <Alert className="border-red-500 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Tu suscripción está inactiva. Reactiva tu plan para acceder a todas las funciones.
            </AlertDescription>
          </Alert>
        );
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Here we would integrate with Stripe
      // For now, we'll simulate the process
      console.log('Initiating Stripe checkout...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would redirect to Stripe Checkout
      alert('Redirigiendo a Stripe Checkout...');
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      // Here we would redirect to Stripe Customer Portal
      console.log('Opening Stripe Customer Portal...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Redirigiendo al portal de gestión de Stripe...');
    } catch (error) {
      console.error('Error opening customer portal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Estado de Suscripción
            </span>
            {getStatusBadge(subscription.status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {getStatusAlert()}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Plan Actual</span>
              </div>
              <p className="text-lg font-semibold">{subscription.plan}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Precio Mensual</span>
              </div>
              <p className="text-lg font-semibold">${subscription.amount}/mes</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">
                  {subscription.status === 'trial' ? 'Prueba termina' : 'Próximo pago'}
                </span>
              </div>
              <p className="text-lg font-semibold">
                {(subscription.status === 'trial' ? subscription.trialEnds : subscription.nextBilling)
                  ?.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            {subscription.status === 'trial' || subscription.status === 'inactive' ? (
              <Button 
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Procesando...' : 'Suscribirse Ahora'}
              </Button>
            ) : (
              <Button 
                onClick={handleManageSubscription}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Cargando...' : 'Gestionar Suscripción'}
              </Button>
            )}
            
            {subscription.status === 'pending' && (
              <Button 
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isLoading ? 'Procesando...' : 'Actualizar Pago'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funciones Incluidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Gestión ilimitada de clientes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Eventos y cotizaciones</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Sistema de pagos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Dashboard analítico</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Envío de propuestas por email</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Exportación a PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Formulario de booking público</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Soporte prioritario</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSettings;
