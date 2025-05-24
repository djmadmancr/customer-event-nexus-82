
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useToast } from '@/hooks/use-toast';

const settingsSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  artistName: z.string().optional(),
  email: z.string().email({ message: 'Debe ser un email válido.' }),
  phone: z.string().min(8, { message: 'El teléfono debe tener al menos 8 caracteres.' }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const AppSettings: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
  const { userProfile, updateUserProfile } = useUserProfile();
  const { logoUrl, updateAppLogo } = useAppConfig();
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
    </div>
  );
};

export default AppSettings;
