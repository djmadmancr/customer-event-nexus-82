
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmailConfig } from '@/contexts/EmailConfigContext';
import { CheckCircle, Mail, Wifi, WifiOff, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmailSettings = () => {
  const { emailConfig, updateEmailConfig, testEmailConnection, configureGmail, isConfigured } = useEmailConfig();
  const { toast } = useToast();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    
    try {
      const success = await testEmailConnection();
      setConnectionStatus(success ? 'success' : 'error');
      
      toast({
        title: success ? "Conexión exitosa" : "Error de conexión",
        description: success 
          ? "La configuración de email está funcionando correctamente" 
          : "No se pudo conectar con el servidor de email",
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Error de conexión",
        description: "No se pudo probar la conexión",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleGmailSetup = () => {
    configureGmail();
    toast({
      title: "Configuración de Gmail aplicada",
      description: "Se han configurado los servidores de Gmail. Completa tu usuario y contraseña.",
    });
  };

  const handleSaveConfiguration = () => {
    if (!isConfigured) {
      toast({
        title: "Configuración incompleta",
        description: "Por favor completa todos los campos requeridos antes de guardar.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Configuración guardada",
      description: "La configuración de email ha sido guardada exitosamente.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Configuración de Email
          <div className="flex items-center gap-2">
            <Button onClick={handleGmailSetup} variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Configurar Gmail
            </Button>
            
            <Button 
              onClick={handleTestConnection} 
              variant="outline" 
              size="sm"
              disabled={isTestingConnection || !isConfigured}
              className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
            >
              {isTestingConnection ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Probando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Probar Conexión
                </div>
              )}
            </Button>

            <Button 
              onClick={handleSaveConfiguration}
              disabled={!isConfigured}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Configuración
            </Button>

            {isConfigured && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Configurado</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Connection Status Alert */}
        {connectionStatus === 'success' && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ¡Conexión exitosa! Tu configuración de email está funcionando correctamente.
            </AlertDescription>
          </Alert>
        )}
        
        {connectionStatus === 'error' && (
          <Alert className="border-red-500 bg-red-50">
            <WifiOff className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Error de conexión. Verifica tus credenciales y configuración del servidor.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuración SMTP (Envío)</h3>
            
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
            
            <div className="flex items-center space-x-2">
              <Switch
                id="smtpSecure"
                checked={emailConfig.smtpSecure}
                onCheckedChange={(checked) => updateEmailConfig({ smtpSecure: checked })}
              />
              <Label htmlFor="smtpSecure">Conexión Segura</Label>
            </div>
            
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

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuración IMAP (Recepción)</h3>
            
            <div className="space-y-2">
              <Label htmlFor="imapHost">Servidor IMAP</Label>
              <Input
                id="imapHost"
                value={emailConfig.imapHost}
                onChange={(e) => updateEmailConfig({ imapHost: e.target.value })}
                placeholder="imap.gmail.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imapPort">Puerto</Label>
              <Input
                id="imapPort"
                type="number"
                value={emailConfig.imapPort}
                onChange={(e) => updateEmailConfig({ imapPort: parseInt(e.target.value) })}
                placeholder="993"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="imapSecure"
                checked={emailConfig.imapSecure}
                onCheckedChange={(checked) => updateEmailConfig({ imapSecure: checked })}
              />
              <Label htmlFor="imapSecure">Conexión Segura</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imapUser">Usuario</Label>
              <Input
                id="imapUser"
                value={emailConfig.imapUser}
                onChange={(e) => updateEmailConfig({ imapUser: e.target.value })}
                placeholder="tu@gmail.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imapPassword">Contraseña</Label>
              <Input
                id="imapPassword"
                type="password"
                value={emailConfig.imapPassword}
                onChange={(e) => updateEmailConfig({ imapPassword: e.target.value })}
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
      </CardContent>
    </Card>
  );
};

export default EmailSettings;
