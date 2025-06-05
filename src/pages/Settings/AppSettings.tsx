import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, Trash2, Mail, TestTube, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useEmailConfig } from '@/contexts/EmailConfigContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Currency } from '@/types/models';

const settingsSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Debe ser un email válido.' }),
  phone: z.string().min(8, { message: 'El teléfono debe tener al menos 8 caracteres.' }),
});

const artisticDataSchema = z.object({
  artistName: z.string().optional(),
});

const appConfigSchema = z.object({
  defaultCurrency: z.enum(['USD', 'CRC', 'EUR']),
  defaultTaxPercentage: z.coerce.number().min(0).max(100),
});

const emailConfigSchema = z.object({
  smtpHost: z.string().min(1, { message: 'El servidor SMTP es requerido.' }),
  smtpPort: z.coerce.number().min(1).max(65535),
  smtpSecure: z.boolean(),
  smtpUser: z.string().min(1, { message: 'El usuario SMTP es requerido.' }),
  smtpPassword: z.string().min(1, { message: 'La contraseña SMTP es requerida.' }),
  imapHost: z.string().min(1, { message: 'El servidor IMAP es requerido.' }),
  imapPort: z.coerce.number().min(1).max(65535),
  imapSecure: z.boolean(),
  imapUser: z.string().min(1, { message: 'El usuario IMAP es requerido.' }),
  imapPassword: z.string().min(1, { message: 'La contraseña IMAP es requerida.' }),
  fromName: z.string().min(1, { message: 'El nombre del remitente es requerido.' }),
  fromEmail: z.string().email({ message: 'Debe ser un email válido.' }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
type ArtisticDataFormValues = z.infer<typeof artisticDataSchema>;
type AppConfigFormValues = z.infer<typeof appConfigSchema>;
type EmailConfigFormValues = z.infer<typeof emailConfigSchema>;

const AppSettings: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
  const [isUpdatingArtisticData, setIsUpdatingArtisticData] = useState(false);
  const [isUpdatingAppConfig, setIsUpdatingAppConfig] = useState(false);
  const [isUpdatingEmailConfig, setIsUpdatingEmailConfig] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showImapPassword, setShowImapPassword] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const { userProfile, updateUserProfile } = useUserProfile();
  const { logoUrl, defaultCurrency, defaultTaxPercentage, updateAppLogo, updateDefaultCurrency, updateDefaultTaxPercentage } = useAppConfig();
  const { emailConfig, updateEmailConfig, isConfigured, testEmailConnection } = useEmailConfig();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Generate unique booking link for this user
  const bookingLink = `${window.location.origin}/booking/${currentUser?.uid}`;

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: userProfile?.name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
    },
  });

  const artisticForm = useForm<ArtisticDataFormValues>({
    resolver: zodResolver(artisticDataSchema),
    defaultValues: {
      artistName: userProfile?.artistName || '',
    },
  });

  const appConfigForm = useForm<AppConfigFormValues>({
    resolver: zodResolver(appConfigSchema),
    defaultValues: {
      defaultCurrency: defaultCurrency,
      defaultTaxPercentage: defaultTaxPercentage,
    },
  });

  const emailConfigForm = useForm<EmailConfigFormValues>({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: emailConfig,
  });

  // Update forms when data changes
  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
      });
      artisticForm.reset({
        artistName: userProfile.artistName || '',
      });
    }
  }, [userProfile, form, artisticForm]);

  React.useEffect(() => {
    appConfigForm.reset({
      defaultCurrency: defaultCurrency,
      defaultTaxPercentage: defaultTaxPercentage,
    });
  }, [defaultCurrency, defaultTaxPercentage, appConfigForm]);

  React.useEffect(() => {
    emailConfigForm.reset(emailConfig);
  }, [emailConfig, emailConfigForm]);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true);
    try {
      updateUserProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
      
      toast({
        title: "Datos actualizados",
        description: "Tu perfil ha sido actualizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar los datos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onArtisticDataSubmit = async (data: ArtisticDataFormValues) => {
    setIsUpdatingArtisticData(true);
    try {
      updateUserProfile({
        artistName: data.artistName,
      });
      
      toast({
        title: "Datos artísticos actualizados",
        description: "Tus datos artísticos han sido actualizados correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar los datos artísticos.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingArtisticData(false);
    }
  };

  const onAppConfigSubmit = async (data: AppConfigFormValues) => {
    setIsUpdatingAppConfig(true);
    try {
      updateDefaultCurrency(data.defaultCurrency);
      updateDefaultTaxPercentage(data.defaultTaxPercentage);
      
      toast({
        title: "Configuración actualizada",
        description: "La configuración de la aplicación ha sido actualizada correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAppConfig(false);
    }
  };

  const onEmailConfigSubmit = async (data: EmailConfigFormValues) => {
    setIsUpdatingEmailConfig(true);
    try {
      updateEmailConfig(data);
      
      toast({
        title: "Configuración de email actualizada",
        description: "La configuración de email ha sido guardada correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración de email.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingEmailConfig(false);
    }
  };

  const handleTestEmailConnection = async () => {
    setIsTestingEmail(true);
    try {
      const isConnected = await testEmailConnection();
      if (isConnected) {
        toast({
          title: "Conexión exitosa",
          description: "La configuración de email está funcionando correctamente.",
        });
      } else {
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con los servidores de email. Verifica la configuración.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al probar la conexión de email.",
        variant: "destructive",
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const copyBookingLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingLink);
      setLinkCopied(true);
      toast({
        title: "Link copiado",
        description: "El link de bookings ha sido copiado al portapapeles.",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el link.",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUpdatingLogo(true);
      
      try {
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          toast({
            title: "Error",
            description: "El archivo es demasiado grande. Máximo 2MB.",
            variant: "destructive",
          });
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Error",
            description: "Solo se permiten archivos de imagen.",
            variant: "destructive",
          });
          return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
          const result = reader.result as string;
          await updateAppLogo(result);
          toast({
            title: "Logo actualizado",
            description: "El logo ha sido guardado correctamente.",
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo guardar el logo.",
          variant: "destructive",
        });
      } finally {
        setIsUpdatingLogo(false);
      }
    }
  };

  const removeLogo = async () => {
    setIsUpdatingLogo(true);
    try {
      await updateAppLogo(null);
      toast({
        title: "Logo eliminado",
        description: "El logo ha sido eliminado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el logo.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingLogo(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <Tabs defaultValue="profile" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="artistic">Datos Artísticos</TabsTrigger>
          <TabsTrigger value="app">Aplicación</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="tu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+506 0000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-crm-primary hover:bg-crm-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : 'Guardar Datos Personales'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artistic">
          <Card>
            <CardHeader>
              <CardTitle>Datos Artísticos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Logo Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Logo de la Empresa</h3>
                  {logoUrl && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Vista previa:</p>
                      <div className="flex items-center justify-between">
                        <img 
                          src={logoUrl} 
                          alt="Logo Preview" 
                          className="max-h-20 max-w-xs border p-2 rounded"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeLogo}
                          disabled={isUpdatingLogo}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar logo
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={isUpdatingLogo}
                    >
                      {isUpdatingLogo ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {logoUrl ? 'Cambiar Logo' : 'Subir Logo'}
                        </>
                      )}
                    </Button>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isUpdatingLogo}
                    />
                    <p className="text-sm text-gray-500">
                      Formatos aceptados: JPG, PNG. Tamaño máximo: 2MB. Recomendado: 200x50px
                    </p>
                  </div>
                </div>

                {/* Artist Name Form */}
                <Form {...artisticForm}>
                  <form onSubmit={artisticForm.handleSubmit(onArtisticDataSubmit)} className="space-y-6">
                    <FormField
                      control={artisticForm.control}
                      name="artistName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Artístico (DJ/Banda)</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre artístico o de la banda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-crm-primary hover:bg-crm-primary/90"
                      disabled={isUpdatingArtisticData}
                    >
                      {isUpdatingArtisticData ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : 'Guardar Datos Artísticos'}
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de la Aplicación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Booking Link Section */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-medium text-gray-700 mb-3">Link para Bookings</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Comparte este link con tus clientes para que puedan solicitar cotizaciones directamente.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={copyBookingLink}
                      className="bg-crm-primary hover:bg-crm-primary/90"
                    >
                      {linkCopied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Link para Bookings
                        </>
                      )}
                    </Button>
                    <div className="flex-1 px-3 py-2 bg-white border rounded text-sm text-gray-600 truncate">
                      {bookingLink}
                    </div>
                  </div>
                </div>

                <Form {...appConfigForm}>
                  <form onSubmit={appConfigForm.handleSubmit(onAppConfigSubmit)} className="space-y-6">
                    <FormField
                      control={appConfigForm.control}
                      name="defaultCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Divisa Principal</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona la divisa" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CRC">Colones Costarricenses (₡)</SelectItem>
                              <SelectItem value="USD">Dólares Americanos ($)</SelectItem>
                              <SelectItem value="EUR">Euros (€)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          <p className="text-sm text-gray-500">
                            Esta divisa se utilizará en toda la plataforma
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={appConfigForm.control}
                      name="defaultTaxPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Porcentaje de Impuesto por Defecto (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              step="0.1"
                              placeholder="13" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-gray-500">
                            Este impuesto se aplicará automáticamente a todos los eventos nuevos
                          </p>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-crm-primary hover:bg-crm-primary/90"
                      disabled={isUpdatingAppConfig}
                    >
                      {isUpdatingAppConfig ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : 'Guardar Configuración'}
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Configuración de Email
              </CardTitle>
              <p className="text-sm text-gray-600">
                Configura tu servidor de email para enviar propuestas en PDF automáticamente.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...emailConfigForm}>
                <form onSubmit={emailConfigForm.handleSubmit(onEmailConfigSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-sm text-gray-700">Configuración SMTP (Envío)</h3>
                      
                      <FormField
                        control={emailConfigForm.control}
                        name="smtpHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Servidor SMTP</FormLabel>
                            <FormControl>
                              <Input placeholder="smtp.gmail.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={emailConfigForm.control}
                          name="smtpPort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Puerto</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="587" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={emailConfigForm.control}
                          name="smtpSecure"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SSL/TLS</FormLabel>
                              <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="false">No</SelectItem>
                                  <SelectItem value="true">Sí</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={emailConfigForm.control}
                        name="smtpUser"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuario SMTP</FormLabel>
                            <FormControl>
                              <Input placeholder="tu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailConfigForm.control}
                        name="smtpPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña SMTP</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showSmtpPassword ? "text" : "password"}
                                  placeholder="••••••••" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                                >
                                  {showSmtpPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-sm text-gray-700">Configuración IMAP (Recepción)</h3>
                      
                      <FormField
                        control={emailConfigForm.control}
                        name="imapHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Servidor IMAP</FormLabel>
                            <FormControl>
                              <Input placeholder="imap.gmail.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={emailConfigForm.control}
                          name="imapPort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Puerto</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="993" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={emailConfigForm.control}
                          name="imapSecure"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SSL/TLS</FormLabel>
                              <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="false">No</SelectItem>
                                  <SelectItem value="true">Sí</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={emailConfigForm.control}
                        name="imapUser"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuario IMAP</FormLabel>
                            <FormControl>
                              <Input placeholder="tu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailConfigForm.control}
                        name="imapPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña IMAP</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showImapPassword ? "text" : "password"}
                                  placeholder="••••••••" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowImapPassword(!showImapPassword)}
                                >
                                  {showImapPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-medium text-sm text-gray-700 mb-4">Información del Remitente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={emailConfigForm.control}
                        name="fromName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Remitente</FormLabel>
                            <FormControl>
                              <Input placeholder="Tu Nombre" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailConfigForm.control}
                        name="fromEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email del Remitente</FormLabel>
                            <FormControl>
                              <Input placeholder="tu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-crm-primary hover:bg-crm-primary/90"
                      disabled={isUpdatingEmailConfig}
                    >
                      {isUpdatingEmailConfig ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : 'Guardar Configuración de Email'}
                    </Button>

                    {isConfigured && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestEmailConnection}
                        disabled={isTestingEmail}
                        className="flex-1 sm:flex-none"
                      >
                        {isTestingEmail ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Probando...
                          </>
                        ) : (
                          <>
                            <TestTube className="mr-2 h-4 w-4" />
                            Probar Conexión
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {isConfigured && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <p className="text-sm text-green-800">
                        ✅ Configuración de email completada. Ahora puedes enviar propuestas por email.
                      </p>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppSettings;
