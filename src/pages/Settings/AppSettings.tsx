import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useEmailConfig } from '@/contexts/EmailConfigContext';
import { useAuth } from '@/contexts/AuthContext';
import { Copy, CheckCircle, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

const artistSchema = z.object({
  artistName: z.string().optional(),
  logo: z.string().url().optional(),
});

const appSchema = z.object({
  currency: z.enum(['USD', 'EUR', 'CRC', 'MXN', 'COP']),
});

const emailSchema = z.object({
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpSecure: z.boolean().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  imapHost: z.string().optional(),
  imapPort: z.number().optional(),
  imapSecure: z.boolean().optional(),
  imapUser: z.string().optional(),
  imapPassword: z.string().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().email().optional(),
});

const AppSettings = () => {
  const { userProfile, updateUserProfile } = useUserProfile();
  const { defaultCurrency, updateDefaultCurrency, logoUrl, updateLogoUrl } = useAppConfig();
  const { emailConfig, updateEmailConfig, testEmailConnection, configureGmail, isConfigured } = useEmailConfig();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userProfile?.name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
    },
  });

  const artistForm = useForm({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      artistName: userProfile?.artistName || '',
      logo: logoUrl || '',
    },
  });

  const appForm = useForm({
    resolver: zodResolver(appSchema),
    defaultValues: {
      currency: defaultCurrency,
    },
  });

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      smtpHost: emailConfig.smtpHost,
      smtpPort: emailConfig.smtpPort,
      smtpSecure: emailConfig.smtpSecure,
      smtpUser: emailConfig.smtpUser,
      smtpPassword: emailConfig.smtpPassword,
      imapHost: emailConfig.imapHost,
      imapPort: emailConfig.imapPort,
      imapSecure: emailConfig.imapSecure,
      imapUser: emailConfig.imapUser,
      imapPassword: emailConfig.imapPassword,
      fromName: emailConfig.fromName,
      fromEmail: emailConfig.fromEmail,
    },
  });

  const handleCopyBookingLink = () => {
    if (currentUser) {
      const bookingUrl = `${window.location.origin}/booking/${currentUser.uid}`;
      navigator.clipboard.writeText(bookingUrl);
      toast({
        title: "Link copiado",
        description: "El link para bookings ha sido copiado al portapapeles",
      });
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const success = await testEmailConnection();
      toast({
        title: success ? "Conexión exitosa" : "Error de conexión",
        description: success 
          ? "La configuración de email está funcionando correctamente" 
          : "No se pudo conectar con el servidor de email",
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="artist">Datos Artísticos</TabsTrigger>
          <TabsTrigger value="app">Aplicación</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={userProfile?.name || ''}
                  onChange={(e) => updateUserProfile({ name: e.target.value })}
                  placeholder="Tu nombre completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={userProfile?.email || ''}
                  onChange={(e) => updateUserProfile({ email: e.target.value })}
                  placeholder="tu@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={userProfile?.phone || ''}
                  onChange={(e) => updateUserProfile({ phone: e.target.value })}
                  placeholder="+506 0000-0000"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artist" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos Artísticos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="artistName">Nombre Artístico</Label>
                <Input
                  id="artistName"
                  value={userProfile?.artistName || ''}
                  onChange={(e) => updateUserProfile({ artistName: e.target.value })}
                  placeholder="Tu nombre artístico"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  value={logoUrl || ''}
                  onChange={(e) => updateLogoUrl(e.target.value)}
                  placeholder="https://ejemplo.com/mi-logo.png"
                />
                {logoUrl && (
                  <div className="mt-2">
                    <img 
                      src={logoUrl} 
                      alt="Logo preview" 
                      className="h-16 w-auto border rounded"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de la Aplicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda por Defecto</Label>
                <select
                  id="currency"
                  value={defaultCurrency}
                  onChange={(e) => updateDefaultCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD - Dólar Estadounidense</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="CRC">CRC - Colón Costarricense</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                  <option value="COP">COP - Peso Colombiano</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Link para Bookings</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentUser ? `${window.location.origin}/booking/${currentUser.uid}` : ''}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button onClick={handleCopyBookingLink} variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Comparte este link con tus clientes para que puedan solicitar cotizaciones
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Email</CardTitle>
              <div className="flex gap-2">
                <Button onClick={handleGmailSetup} variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Configurar Gmail
                </Button>
                <Button 
                  onClick={handleTestConnection} 
                  variant="outline" 
                  size="sm"
                  disabled={isTestingConnection || !isConfigured}
                >
                  {isTestingConnection ? 'Probando...' : 'Probar Conexión'}
                </Button>
                {isConfigured && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Configurado</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppSettings;
