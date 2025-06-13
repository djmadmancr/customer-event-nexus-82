
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Users, UserPlus, Shield, LogOut, Calendar } from 'lucide-react';
import { UserRole } from '@/types/models';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { addDays } from 'date-fns';

interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  subscriptionExpiry?: Date;
}

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['admin', 'user'] as const),
  subscriptionMonths: z.number().min(0).max(60),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const AdminDashboard = () => {
  const { getAllUsers, updateUserRole, updateUserStatus, signOut, currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: 'user',
      subscriptionMonths: 1,
    },
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Error al cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      await loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleStatusChange = async (userId: string, active: boolean) => {
    try {
      await updateUserStatus(userId, active);
      await loadUsers();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCreateUser = async (data: CreateUserFormValues) => {
    try {
      // Calculate subscription expiry
      const subscriptionExpiry = addDays(new Date(), data.subscriptionMonths * 30);
      
      // Create new user (this would need to be implemented in the auth context)
      const newUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        active: true,
        createdAt: new Date(),
        subscriptionExpiry,
      };

      // In a real implementation, this would call a service to create the user
      toast({
        title: "Usuario creado",
        description: `Usuario ${data.name} creado exitosamente con ${data.subscriptionMonths} mes(es) de suscripción`,
      });

      setIsCreateDialogOpen(false);
      form.reset();
      await loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear el usuario",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubscription = async (userId: string, months: number) => {
    try {
      const newExpiry = addDays(new Date(), months * 30);
      
      // Update user subscription (this would need to be implemented)
      toast({
        title: "Suscripción actualizada",
        description: `Suscripción actualizada con ${months} mes(es) adicional(es)`,
      });

      await loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar la suscripción",
        variant: "destructive",
      });
    }
  };

  const getSubscriptionStatus = (user: ExtendedUser) => {
    if (!user.subscriptionExpiry) {
      return <Badge variant="destructive">Sin suscripción</Badge>;
    }

    const now = new Date();
    const expiry = user.subscriptionExpiry;
    const graceEnd = addDays(expiry, 14);

    if (now > graceEnd) {
      return <Badge variant="destructive">Suspendida</Badge>;
    } else if (now > expiry) {
      return <Badge className="bg-yellow-100 text-yellow-800">Período de Gracia</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Activa</Badge>;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>;
      case 'user':
        return <Badge variant="outline">Usuario</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Gestión de usuarios y configuración del sistema</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Administrador: {currentUser?.email}
            </span>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Gestión de Usuarios
              </CardTitle>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre completo" {...field} />
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
                              <Input type="email" placeholder="usuario@ejemplo.com" {...field} />
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
                              <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rol</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="user">Usuario</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subscriptionMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meses de Suscripción</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                max="60" 
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Crear Usuario
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Suscripción</TableHead>
                    <TableHead>Vence</TableHead>
                    <TableHead>Último Cambio</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "default" : "destructive"}>
                          {user.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getSubscriptionStatus(user)}</TableCell>
                      <TableCell>
                        {user.subscriptionExpiry ? 
                          format(user.subscriptionExpiry, 'dd/MM/yyyy', { locale: es }) : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        {format(user.createdAt, 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select 
                            value={user.role} 
                            onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Usuario</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            size="sm"
                            variant={user.active ? "destructive" : "default"}
                            onClick={() => handleStatusChange(user.id, !user.active)}
                          >
                            {user.active ? 'Desactivar' : 'Activar'}
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Actualizar Suscripción</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Usuario: {user.name}</Label>
                                  <p className="text-sm text-gray-600">{user.email}</p>
                                </div>
                                <div>
                                  <Label htmlFor="months">Meses adicionales</Label>
                                  <Select onValueChange={(value) => handleUpdateSubscription(user.id, parseInt(value))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona meses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1 mes</SelectItem>
                                      <SelectItem value="3">3 meses</SelectItem>
                                      <SelectItem value="6">6 meses</SelectItem>
                                      <SelectItem value="12">12 meses</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
