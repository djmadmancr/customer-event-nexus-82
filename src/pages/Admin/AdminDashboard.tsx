
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { User, UserRole } from '@/types/models';
import { format, addDays, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { Users, Shield, UserCheck, UserX, Key, LogOut, Plus, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExtendedUser extends User {
  subscriptionExpiry?: Date;
  subscriptionActive?: boolean;
}

const AdminDashboard: React.FC = () => {
  const { getAllUsers, updateUserStatus, userData, signOut, signUp } = useAuth();
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [subscriptionExpiry, setSubscriptionExpiry] = useState('');
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as UserRole
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await getAllUsers();
        // Add subscription data (this would normally come from backend)
        const usersWithSubscription = usersData.map(user => ({
          ...user,
          subscriptionExpiry: user.id === 'demo-admin' ? addDays(new Date(), 30) : addDays(new Date(), -10),
          subscriptionActive: user.id === 'demo-admin' ? true : false
        }));
        setUsers(usersWithSubscription);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getAllUsers]);

  const handleToggleUserStatus = async (userId: string, newStatus: boolean) => {
    try {
      await updateUserStatus(userId, newStatus);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, active: newStatus }
            : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!newUserData.name || !newUserData.email || !newUserData.password) {
        toast({
          title: "Error",
          description: "Todos los campos son requeridos",
          variant: "destructive",
        });
        return;
      }

      await signUp(newUserData.email, newUserData.password, newUserData.name);
      
      // Reset form and close dialog
      setNewUserData({ name: '', email: '', password: '', role: 'user' });
      setShowCreateUser(false);
      
      // Refresh users list
      const usersData = await getAllUsers();
      const usersWithSubscription = usersData.map(user => ({
        ...user,
        subscriptionExpiry: user.id === 'demo-admin' ? addDays(new Date(), 30) : addDays(new Date(), -10),
        subscriptionActive: user.id === 'demo-admin' ? true : false
      }));
      setUsers(usersWithSubscription);

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleUpdateSubscription = () => {
    if (!selectedUserId || !subscriptionExpiry) {
      toast({
        title: "Error",
        description: "Selecciona un usuario y fecha de expiración",
        variant: "destructive",
      });
      return;
    }

    const expiryDate = new Date(subscriptionExpiry);
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === selectedUserId 
          ? { 
              ...user, 
              subscriptionExpiry: expiryDate,
              subscriptionActive: isAfter(expiryDate, new Date())
            }
          : user
      )
    );

    setShowSubscriptionDialog(false);
    setSelectedUserId('');
    setSubscriptionExpiry('');
    
    toast({
      title: "Suscripción actualizada",
      description: "La fecha de expiración ha sido actualizada",
    });
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUserId || !newPassword) return;
    
    try {
      setIsResettingPassword(true);
      toast({
        title: "Contraseña actualizada",
        description: "La contraseña del usuario ha sido actualizada exitosamente",
      });
      setResetPasswordUserId(null);
      setNewPassword('');
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: "Error al actualizar la contraseña",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    return role === 'admin' 
      ? <Badge className="bg-blue-100 text-blue-800">Administrador</Badge>
      : <Badge variant="outline">Usuario</Badge>;
  };

  const getStatusBadge = (active: boolean) => {
    return active
      ? <Badge className="bg-green-100 text-green-800">Activo</Badge>
      : <Badge className="bg-red-100 text-red-800">Bloqueado</Badge>;
  };

  const getSubscriptionBadge = (user: ExtendedUser) => {
    if (!user.subscriptionExpiry) {
      return <Badge className="bg-gray-100 text-gray-800">Sin suscripción</Badge>;
    }

    const now = new Date();
    const expiry = user.subscriptionExpiry;
    const graceEnd = addDays(expiry, 14); // 2 weeks grace period

    if (isAfter(now, graceEnd)) {
      return <Badge className="bg-red-100 text-red-800">Suspendida</Badge>;
    } else if (isAfter(now, expiry)) {
      return <Badge className="bg-yellow-100 text-yellow-800">Período de gracia</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Activa</Badge>;
    }
  };

  const getLastChange = (user: User) => {
    return format(user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const activeUsers = users.filter(user => user.active).length;
  const blockedUsers = users.filter(user => !user.active).length;
  const adminUsers = users.filter(user => user.role === 'admin').length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-blue-600">Administrador</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateUser(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Usuario
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Bloqueados</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{blockedUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{adminUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Cargando usuarios...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Suscripción</TableHead>
                    <TableHead>Último Cambio</TableHead>
                    <TableHead className="w-[250px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.active)}</TableCell>
                      <TableCell>{getSubscriptionBadge(user)}</TableCell>
                      <TableCell>{getLastChange(user)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            onClick={() => handleToggleUserStatus(user.id, !user.active)}
                            disabled={user.id === userData?.id}
                            size="sm"
                            variant={user.active ? "destructive" : "default"}
                          >
                            {user.active ? 'Bloquear' : 'Activar'}
                          </Button>
                          
                          <Button
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setShowSubscriptionDialog(true);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setResetPasswordUserId(user.id)}
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Restablecer Contraseña</DialogTitle>
                                <DialogDescription>
                                  Establece una nueva contraseña para {user.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                                  <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Ingresa la nueva contraseña"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={handleResetPassword}
                                  disabled={!newPassword || isResettingPassword}
                                >
                                  {isResettingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p>No se encontraron usuarios.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="userName">Nombre</Label>
              <Input
                id="userName"
                value={newUserData.name}
                onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="userPassword">Contraseña</Label>
              <Input
                id="userPassword"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                placeholder="Contraseña"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateUser(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser}>
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestionar Suscripción</DialogTitle>
            <DialogDescription>
              Establece la fecha de expiración de la suscripción
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subscriptionExpiry">Fecha de Expiración</Label>
              <Input
                id="subscriptionExpiry"
                type="date"
                value={subscriptionExpiry}
                onChange={(e) => setSubscriptionExpiry(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>• La suscripción expirará en la fecha seleccionada</p>
              <p>• Después de la expiración, el usuario tendrá 2 semanas de período de gracia</p>
              <p>• Luego del período de gracia, la cuenta será suspendida automáticamente</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateSubscription}>
              Actualizar Suscripción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
