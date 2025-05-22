
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, UserRole } from '@/types/models';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, MoreVertical } from 'lucide-react';

const UserManagement: React.FC = () => {
  const { getAllUsers, updateUserRole, updateUserStatus, userData } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<{ userId: string; action: string; payload?: any } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await getAllUsers();
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getAllUsers]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(user => 
          user.name.toLowerCase().includes(query) || 
          user.email.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setSelectedAction({
      userId,
      action: 'role',
      payload: newRole
    });
    setIsConfirmOpen(true);
  };

  const handleToggleStatus = async (userId: string, newStatus: boolean) => {
    setSelectedAction({
      userId,
      action: 'status',
      payload: newStatus
    });
    setIsConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedAction) return;
    
    try {
      if (selectedAction.action === 'role') {
        await updateUserRole(selectedAction.userId, selectedAction.payload);
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedAction.userId 
              ? { ...user, role: selectedAction.payload }
              : user
          )
        );
      } else if (selectedAction.action === 'status') {
        await updateUserStatus(selectedAction.userId, selectedAction.payload);
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedAction.userId 
              ? { ...user, active: selectedAction.payload }
              : user
          )
        );
      }
      setIsConfirmOpen(false);
      setSelectedAction(null);
    } catch (error) {
      console.error("Error updating user:", error);
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
      : <Badge className="bg-red-100 text-red-800">Inactivo</Badge>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
      
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar usuarios..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crm-primary mx-auto"></div>
              <p className="mt-2">Cargando usuarios...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead className="w-[80px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.active)}</TableCell>
                      <TableCell>
                        {format(user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild disabled={user.id === userData?.id}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}>
                              Cambiar a {user.role === 'admin' ? 'Usuario' : 'Administrador'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(user.id, !user.active)}>
                              {user.active ? 'Desactivar' : 'Activar'} usuario
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p>No se encontraron usuarios.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Acción</DialogTitle>
            <DialogDescription>
              {selectedAction?.action === 'role' && (
                <>
                  ¿Estás seguro de que deseas cambiar el rol del usuario a{' '}
                  <strong>
                    {selectedAction.payload === 'admin' ? 'Administrador' : 'Usuario normal'}
                  </strong>?
                </>
              )}
              {selectedAction?.action === 'status' && (
                <>
                  ¿Estás seguro de que deseas{' '}
                  <strong>
                    {selectedAction.payload ? 'activar' : 'desactivar'}
                  </strong>{' '}
                  este usuario?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmAction}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
