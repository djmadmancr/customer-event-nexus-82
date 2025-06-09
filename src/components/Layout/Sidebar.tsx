
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useIsMobile } from '@/hooks/use-mobile';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Clientes', href: '/customers', icon: Users },
  { name: 'Eventos', href: '/events', icon: Calendar },
  { name: 'Pagos', href: '/payments', icon: Coins },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logoUrl } = useAppConfig();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      <div className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out z-50",
        isMobile ? "w-64" : "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <img 
              src="./logo.png" 
              alt="Bassline Logo" 
              className="h-8 w-auto max-w-[150px]"
              onError={(e) => {
                // If the main logo fails, try the logoUrl from config
                if (logoUrl) {
                  (e.currentTarget as HTMLImageElement).src = logoUrl;
                } else {
                  // If both fail, hide the image and show text
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const textElement = document.createElement('div');
                  textElement.className = 'text-xl font-bold text-crm-primary';
                  textElement.textContent = 'BASSLINECRM';
                  (e.currentTarget as HTMLImageElement).parentNode?.appendChild(textElement);
                }
              }}
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={isMobile ? onClose : undefined}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? 'bg-crm-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
