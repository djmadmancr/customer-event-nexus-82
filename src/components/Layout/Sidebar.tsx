
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Calendar, CreditCard, Settings, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  mobileOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, mobileOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: <TrendingUp className="h-5 w-5" />,
      exact: true 
    },
    { 
      name: 'Clientes', 
      path: '/customers', 
      icon: <Users className="h-5 w-5" />,
      exact: false 
    },
    { 
      name: 'Eventos', 
      path: '/events', 
      icon: <Calendar className="h-5 w-5" />,
      exact: false 
    },
    { 
      name: 'Pagos', 
      path: '/payments', 
      icon: <CreditCard className="h-5 w-5" />,
      exact: false 
    },
    { 
      name: 'Configuración', 
      path: '/settings', 
      icon: <Settings className="h-5 w-5" />,
      exact: false 
    },
  ];
  
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-16",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "pt-16 md:pt-16 md:z-20"
        )}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center md:hidden mb-6">
            <h2 className="text-lg font-semibold">Menú</h2>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 rounded-md transition-colors relative",
                  location.pathname === item.path
                    ? "bg-crm-accent text-crm-primary font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                title={!isOpen ? item.name : undefined}
              >
                <div className="flex items-center">
                  {item.icon}
                  <span className={cn(
                    "ml-3 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 hidden md:block md:absolute md:pointer-events-none"
                  )}>
                    {item.name}
                  </span>
                </div>
              </Link>
            ))}
          </nav>
          
          <div className={cn(
            "mt-auto pt-6",
            !isOpen && "hidden"
          )}>
            <div className="bg-crm-accent rounded-md p-4">
              <h3 className="font-medium text-crm-primary mb-2">Tip del día</h3>
              <p className="text-sm text-gray-600">
                Añade notas detalladas sobre tus clientes para recordar detalles importantes.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
