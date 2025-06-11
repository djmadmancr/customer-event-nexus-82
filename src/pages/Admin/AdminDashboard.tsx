
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Users, Shield, UserCheck, UserX, Key, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const { getAllUsers, updateUserStatus, userData, signOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await getAllUsers();
        setUsers(usersData);
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

  const handleResetPassword = async () => {
    if (!resetPasswordUserId || !newPassword) return;
    
    try {
      setIsResettingPassword(true);
      // In a real app, this would call a backend API to reset the password
      // For demo purposes, we'll just show a success message
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

  const getSubscriptionBadge = (userId: string) => {
    // In a real app, this would check actual subscription status
    // For demo purposes, we'll show random statuses
    const statuses = ['active', 'inactive', 'trial'];
    const status = statuses[userId.length % 3];
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Activa</Badge>;
      case 'trial':
        return <Badge className="bg-yellow-100 text-yellow-800">Prueba</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Inactiva</Badge>;
    }
  };

  const getLastChange = (user: User) => {
    // In a real app, this would track actual last changes
    // For demo purposes, we'll use creation date
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
        <Button
          onClick={handleLogout}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
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
                    <TableHead className="w-[200px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.active)}</TableCell>
                      <TableCell>{getSubscriptionBadge(user.id)}</TableCell>
                      <TableCell>{getLastChange(user)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleToggleUserStatus(user.id, !user.active)}
                            disabled={user.id === userData?.id}
                            size="sm"
                            variant={user.active ? "destructive" : "default"}
                          >
                            {user.active ? 'Bloquear' : 'Activar'}
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
    </div>
  );
};

export default AdminDashboard;
