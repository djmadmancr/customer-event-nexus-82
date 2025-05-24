
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
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useToast } from '@/hooks/use-toast';
import { Currency } from '@/types/models';

const settingsSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  artistName: z.string().optional(),
  email: z.string().email({ message: 'Debe ser un email válido.' }),
  phone: z.string().min(8, { message: 'El teléfono debe tener al menos 8 caracteres.' }),
});

const appConfigSchema = z.object({
  defaultCurrency: z.enum(['USD', 'CRC', 'EUR']),
  defaultTaxPercentage: z.coerce.number().min(0).max(100),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
type AppConfigFormValues = z.infer<typeof appConfigSchema>;

const AppSettings: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
  const [isUpdatingAppConfig, setIsUpdatingAppConfig] = useState(false);
  const { userProfile, updateUserProfile } = useUserProfile();
  const { logoUrl, defaultCurrency, defaultTaxPercentage, updateAppLogo, updateDefaultCurrency, updateDefaultTaxPercentage } = useAppConfig();
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: userProfile?.name || '',
      artistName: userProfile?.artistName || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
    },
  });

  const appConfigForm = useForm<AppConfigFormValues>({
    resolver: zodResolver(appConfigSchema),
    defaultValues: {
      defaultCurrency: defaultCurrency,
      defaultTaxPercentage: defaultTaxPercentage,
    },
  });

  // Update form when userProfile changes
  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name,
        artistName: userProfile.artistName || '',
        email: userProfile.email,
        phone: userProfile.phone,
      });
    }
  }, [userProfile, form]);

  // Update app config form when values change
  React.useEffect(() => {
    appConfigForm.reset({
      defaultCurrency: defaultCurrency,
      defaultTaxPercentage: defaultTaxPercentage,
    });
  }, [defaultCurrency, defaultTaxPercentage, appConfigForm]);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true);
    try {
      updateUserProfile({
        name: data.name,
        artistName: data.artistName,
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
      <Card className="max-w-2xl mx-auto">
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

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Logo de la Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
        </CardContent>
      </Card>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configuración de la Aplicación</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AppSettings;
