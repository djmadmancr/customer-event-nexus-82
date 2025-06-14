
import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    if (notification.targetType === 'event' && notification.targetId) {
      navigate(`/events/${notification.targetId}`);
    }
    markAsRead(notification.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex justify-between items-center p-2">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            {notifications.length > 0 && (
                 <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <Check className="h-4 w-4 mr-1" />
                    Marcar leídas
                </Button>
            )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={`flex flex-col items-start cursor-pointer ${!n.isRead ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(n)}
              >
                <p className={`font-semibold ${!n.isRead ? 'text-blue-800' : ''}`}>{n.title}</p>
                <p className="text-sm text-muted-foreground whitespace-normal">{n.message}</p>
                <p className="text-xs text-muted-foreground self-end mt-1">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <p className="p-4 text-sm text-center text-muted-foreground">No hay notificaciones</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
