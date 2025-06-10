
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmailConfig } from '@/contexts/EmailConfigContext';
import { CheckCircle, Wifi, WifiOff, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EmailSettings = () => {
  const { emailConfig, updateEmailConfig, isConfigured } = useEmailConfig();
  const { toast } = useToast();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error' | 'not_connected'>('idle');
  const [isSaving, setIsSaving] = useState(false);

  const handleTestConnection = async () => {
    if (!isConfigured) {
      setConnectionStatus('not_connected');
      toast({
        title: "Configuración incompleta",
        description: "Por favor completa todos los campos requeridos antes de probar la conexión.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        setConnectionStatus('error');
        toast({
          title: "Error",
          description: "Debes iniciar sesión para probar la conexión",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('test-email', {
        body: { emailConfig },
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        console.error('Error testing email connection:', error);
        setConnectionStatus('error');
        toast({
          title: "Conexión fallida",
          description: "No se pudo conectar al servidor SMTP",
          variant: "destructive",
        });
        return;
      }

      if (data.success) {
        setConnectionStatus('success');
        toast({
          title: "Conexión exitosa",
          description: data.message,
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Conexión fallida",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in handleTestConnection:', error);
      setConnectionStatus('error');
      toast({
        title: "Conexión fallida",
        description: "No se pudo conectar al servidor SMTP",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!isConfigured) {
      toast({
        title: "Configuración incompleta",
        description: "Por favor completa todos los campos requeridos antes de guardar.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Configuración guardada",
        description: "La configuración de email ha sido guardada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getConnectionStatusDisplay = () => {
    if (!isConfigured) {
      return (
        <div className="flex items-center text-red-600">
          <WifiOff className="h-4 w-4 mr-1" />
          <span className="text-sm">No configurado</span>
        </div>
      );
    }

    switch (connectionStatus) {
      case 'success':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="text-sm">Conectado</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-600">
            <WifiOff className="h-4 w-4 mr-1" />
            <span className="text-sm">Conexión fallida</span>
          </div>
        );
      case 'not_connected':
        return (
          <div className="flex items-center text-red-600">
            <WifiOff className="h-4 w-4 mr-1" />
            <span className="text-sm">No conectado</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span className="text-sm">Sin probar</span>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Configuración de Email SMTP
          {getConnectionStatusDisplay()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Configuración del Servidor SMTP</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">Servidor SMTP</Label>
              <Input
                id="smtpHost"
                value={emailConfig.smtpHost}
                onChange={(e) => updateEmailConfig({ smtpHost: e.target.value })}
                placeholder="smtp.gmail.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Puerto</Label>
              <Input
                id="smtpPort"
                type="number"
                value={emailConfig.smtpPort}
                onChange={(e) => updateEmailConfig({ smtpPort: parseInt(e.target.value) })}
                placeholder="587"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="smtpSecure"
              checked={emailConfig.smtpSecure}
              onCheckedChange={(checked) => updateEmailConfig({ smtpSecure: checked })}
            />
            <Label htmlFor="smtpSecure">Conexión Segura (SSL/TLS)</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpUser">Usuario</Label>
              <Input
                id="smtpUser"
                value={emailConfig.smtpUser}
                onChange={(e) => updateEmailConfig({ smtpUser: e.target.value })}
                placeholder="tu@gmail.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">Contraseña</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={emailConfig.smtpPassword}
                onChange={(e) => updateEmailConfig({ smtpPassword: e.target.value })}
                placeholder="Contraseña o App Password"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-medium">Información del Remitente</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromName">Nombre del Remitente</Label>
              <Input
                id="fromName"
                value={emailConfig.fromName}
                onChange={(e) => updateEmailConfig({ fromName: e.target.value })}
                placeholder="Tu Nombre"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fromEmail">Email del Remitente</Label>
              <Input
                id="fromEmail"
                value={emailConfig.fromEmail}
                onChange={(e) => updateEmailConfig({ fromEmail: e.target.value })}
                placeholder="tu@gmail.com"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            onClick={handleTestConnection} 
            variant="outline" 
            disabled={isTestingConnection || !isConfigured}
            className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
          >
            {isTestingConnection ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Probando conexión...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Probar Conexión SMTP
              </div>
            )}
          </Button>

          <Button 
            onClick={handleSaveConfiguration}
            disabled={!isConfigured || isSaving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>

        {connectionStatus === 'success' && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ¡Conexión exitosa! El servidor SMTP está funcionando correctamente.
            </AlertDescription>
          </Alert>
        )}
        
        {(connectionStatus === 'error' || connectionStatus === 'not_connected') && (
          <Alert className="border-red-500 bg-red-50">
            <WifiOff className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {connectionStatus === 'not_connected' 
                ? 'No conectado. Completa la configuración y prueba la conexión.'
                : 'Conexión fallida. Verifica tus credenciales y configuración del servidor.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Configuración común para proveedores:</h4>
          <ul className="space-y-1 text-xs">
            <li>• <strong>Gmail:</strong> smtp.gmail.com, Puerto 587, Usar contraseña de aplicación</li>
            <li>• <strong>Outlook:</strong> smtp-mail.outlook.com, Puerto 587</li>
            <li>• <strong>Yahoo:</strong> smtp.mail.yahoo.com, Puerto 587</li>
            <li>• <strong>Hotmail:</strong> smtp.live.com, Puerto 587</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSettings;
