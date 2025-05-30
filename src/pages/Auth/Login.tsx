
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
import { AlertCircle, CheckCircle } from 'lucide-react';
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
  const [debugInfo, setDebugInfo] = useState<string>('');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Auto-fill demo credentials
  const fillDemoCredentials = () => {
    form.setValue('email', 'djmadmancr@gmail.com');
    form.setValue('password', 'Djmadman001k');
    setDebugInfo('Credenciales demo cargadas ✅');
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      setLoginError(null);
      setDebugInfo(`Intentando login con: ${data.email}`);
      
      console.log('🔄 Form data:', data);
      
      await signIn(data.email, data.password);
      
      setDebugInfo('Login exitoso! Redirigiendo...');
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('/');
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      setLoginError('Error: ' + (error.message || 'Credenciales incorrectas'));
      setDebugInfo('Error en login: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Debug info */}
      {debugInfo && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Debug: {debugInfo}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick fill button */}
      <Button 
        type="button" 
        variant="outline" 
        className="w-full border-green-500 text-green-700 hover:bg-green-50"
        onClick={fillDemoCredentials}
      >
        🚀 Usar Credenciales Demo
      </Button>

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
                    placeholder="djmadmancr@gmail.com" 
                    type="email" 
                    {...field} 
                    className="font-mono"
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
                    placeholder="Djmadman001k" 
                    type="password" 
                    {...field} 
                    className="font-mono"
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
