
import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

const settingsSchema = z.object({
  appName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  logoUrl: z.string().url({ message: 'Debe ser una URL válida.' }).optional().or(z.literal('')),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const AppSettingsForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      appName: 'CRM Sistema de Gestión',
      logoUrl: '',
    },
  });

  // Load current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = doc(firestore, 'settings', 'appSettings');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          form.reset({
            appName: data.appName || 'CRM Sistema de Gestión',
            logoUrl: data.logoUrl || '',
          });
        }
      } catch (error) {
        console.error('Error loading app settings:', error);
      }
    };
    
    fetchSettings();
  }, [form]);

  const onSubmit = async (data: SettingsFormValues) => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    try {
      const settingsRef = doc(firestore, 'settings', 'appSettings');
      
      await setDoc(settingsRef, {
        ...data,
        updatedAt: new Date(),
        updatedBy: currentUser.uid,
      }, { merge: true });
      
      toast({
        title: "Configuración actualizada",
        description: "La configuración de la aplicación ha sido actualizada correctamente.",
      });
      
      // Reload the page to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL del Logo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://ejemplo.com/logo.png" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-gray-500 mt-1">
                Ingresa la URL completa de una imagen. Tamaño recomendado: 200x50px
              </p>
            </FormItem>
          )}
        />
        
        <div className="pt-4">
          {form.watch("logoUrl") && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Vista previa:</p>
              <img 
                src={form.getValues().logoUrl} 
                alt="Logo Preview" 
                className="max-h-12 max-w-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  toast({
                    title: "Error de imagen",
                    description: "La URL de la imagen no es válida.",
                    variant: "destructive",
                  });
                }}
                onLoad={(e) => {
                  (e.target as HTMLImageElement).style.display = 'block';
                }}
                style={{ display: 'none' }}
              />
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-crm-primary hover:bg-crm-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AppSettingsForm;
