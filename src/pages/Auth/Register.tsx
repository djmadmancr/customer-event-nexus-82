
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
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
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Enhanced validation schema
const registerSchema = z.object({
  name: z.string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
    .max(50, { message: 'El nombre no puede exceder 50 caracteres.' })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre solo puede contener letras y espacios.' }),
  email: z.string()
    .email({ message: 'Email inválido.' })
    .min(1, { message: 'El email es requerido.' })
    .max(100, { message: 'El email no puede exceder 100 caracteres.' }),
  password: z.string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    .regex(/(?=.*[a-z])/, { message: 'Debe contener al menos una letra minúscula.' })
    .regex(/(?=.*[A-Z])/, { message: 'Debe contener al menos una letra mayúscula.' })
    .regex(/(?=.*\d)/, { message: 'Debe contener al menos un número.' }),
  confirmPassword: z.string().min(6, { message: 'La confirmación de contraseña es requerida.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterProps {
  onSwitchToLogin?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur', // Validate on blur for better UX
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      setRegisterError(null);
      
      console.log('🔄 Registration attempt for:', data.email);
      
      await signUp(data.email, data.password, data.name);
      
      setRegisterSuccess(true);
      form.reset();
      
      // Switch to login after showing success message
      setTimeout(() => {
        if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      }, 3000);
      
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      
      let errorMessage = 'Error al registrar. Intenta nuevamente.';
      if (error?.message) {
        errorMessage = error.message;
      }
      
      setRegisterError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registerSuccess) {
    return (
      <div className="space-y-4">
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ¡Cuenta creada exitosamente! 
            <br />
            <span className="text-sm">Serás redirigido al inicio de sesión en unos segundos...</span>
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Button 
            onClick={onSwitchToLogin} 
            variant="outline"
            className="mt-4"
          >
            Ir a Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {registerError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{registerError}</AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ingresa tu nombre completo" 
                  autoComplete="name"
                  {...field} 
                />
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
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="correo@ejemplo.com" 
                  type="email" 
                  autoComplete="email"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...field} 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
              <div className="text-xs text-gray-500 mt-1">
                Mínimo 6 caracteres, debe incluir mayúscula, minúscula y número
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Contraseña *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="••••••••" 
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...field} 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
        
        <Button 
          type="submit" 
          className="w-full bg-crm-primary hover:bg-crm-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>

        {onSwitchToLogin && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-crm-primary hover:underline font-medium"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        )}
        
        <div className="text-xs text-gray-500 text-center">
          * Campos requeridos
        </div>
      </form>
    </Form>
  );
};

export default Register;
