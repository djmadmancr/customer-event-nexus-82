
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

const Login: React.FC = () => {
  const { signIn, userRole } = useAuth();
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
      await signIn(data.email, data.password);
      
      // Redirect based on user role
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      setLoginError('Error al iniciar sesión. Verifica tus credenciales e intenta nuevamente.');
      // Error is handled by auth context as well
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {loginError && (
                <Alert variant="destructive" className="mb-4">
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
                      <Input placeholder="correo@ejemplo.com" type="email" {...field} />
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
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-4">
                  <strong>Credenciales de prueba:</strong><br />
                  Admin: admin@ejemplo.com / admin123<br />
                  Usuario: usuario@ejemplo.com / usuario123
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-crm-primary hover:bg-crm-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <div className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-crm-primary hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
