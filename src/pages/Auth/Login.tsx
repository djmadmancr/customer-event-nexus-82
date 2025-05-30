
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginProps {
  onSwitchToRegister?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      setLoginError(null);
      
      console.log('🔄 Form data:', data);
      
      await signIn(data.email, data.password);
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('/');
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      setLoginError('Error: ' + (error.message || 'Credenciales incorrectas'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {loginError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="tu@email.com" 
                    type="email" 
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
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Tu contraseña" 
                    type="password" 
                    {...field} 
                  />
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
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          {onSwitchToRegister && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-crm-primary hover:underline"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default Login;
