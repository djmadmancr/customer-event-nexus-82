
import React, { useState } from 'react';
import { Bell, Menu, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { currentUser, signOut } = useAuth();
  const { userProfile } = useUserProfile();
  const { logoUrl } = useAppConfig();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    setNotificationsOpen(false);

    // Navigate based on notification type and targetType
    if (notification.targetType === 'event' && notification.targetId) {
      navigate(`/events/${notification.targetId}`);
    } else if (notification.targetType === 'customer' && notification.targetId) {
      navigate(`/customers/${notification.targetId}`);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center ml-2 md:ml-0">
            <img 
              src="./logo.png" 
              alt="Bassline Logo" 
              className="h-8 w-auto max-w-[200px] mr-3"
              onError={(e) => {
                // If the main logo fails, try the logoUrl from config
                if (logoUrl) {
                  (e.currentTarget as HTMLImageElement).src = logoUrl;
                } else {
                  // If both fail, hide the image
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <h3 className="font-medium">Notificaciones</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No hay notificaciones
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(notification.createdAt, 'PPp', { locale: es })}
                      </p>
                    </div>
                  ))
                )}
              </div>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <div className="p-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full" onClick={handleMarkAllAsRead}>
                    Marcar todas como leídas
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-crm-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {userProfile?.name || 'Usuario'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <p className="text-sm font-medium">{userProfile?.name || 'Usuario'}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
