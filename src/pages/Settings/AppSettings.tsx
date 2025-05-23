
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
import { Loader2, Upload } from 'lucide-react';
import { useAppConfig } from '@/contexts/AppConfigContext';

const settingsSchema = z.object({
  appName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  logoUrl: z.string().url({ message: 'Debe ser una URL válida.' }).optional().or(z.literal('')),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const AppSettings: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { appName, logoUrl, updateAppConfig } = useAppConfig();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      appName: appName,
      logoUrl: logoUrl || '',
    },
  });

  // Update form when appName or logoUrl changes
  React.useEffect(() => {
    form.reset({
      appName: appName,
      logoUrl: logoUrl || '',
    });
    setPreviewUrl(logoUrl);
  }, [appName, logoUrl, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true);
    try {
      await updateAppConfig(data.appName, data.logoUrl || null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        form.setValue('logoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configuración de la Aplicación</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="appName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Aplicación</FormLabel>
                    <FormControl>
                      <Input placeholder="CRM Sistema de Gestión" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel>Logo de la Aplicación</FormLabel>
                <div className="flex flex-col space-y-4">
                  {previewUrl && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Vista previa:</p>
                      <img 
                        src={previewUrl} 
                        alt="Logo Preview" 
                        className="max-h-20 max-w-xs border p-2 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Subir Logo
                      </Button>
                      {previewUrl && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setPreviewUrl(null);
                            form.setValue('logoUrl', '');
                          }}
                        >
                          Eliminar logo
                        </Button>
                      )}
                    </div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Formatos aceptados: JPG, PNG. Tamaño recomendado: 200x50px
                    </p>
                  </div>
                </div>
                <FormMessage>{form.formState.errors.logoUrl?.message}</FormMessage>
              </div>
              
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
