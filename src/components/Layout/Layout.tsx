
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const toggleSidebar = () => {
    // On mobile
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      // On desktop
      setSidebarOpen(!sidebarOpen);
    }
  };
  
  // Get title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path === '/customers') return 'Gestión de Clientes';
    if (path.includes('/customers/') && path.includes('/edit')) return 'Editar Cliente';
    if (path.includes('/customers/') && path.includes('/new')) return 'Nuevo Cliente';
    if (path.includes('/customers/')) return 'Detalle del Cliente';
    
    if (path === '/events') return 'Gestión de Eventos';
    if (path.includes('/events/') && path.includes('/edit')) return 'Editar Evento';
    if (path.includes('/events/') && path.includes('/new')) return 'Nuevo Evento';
    if (path.includes('/events/')) return 'Detalle del Evento';
    
    if (path === '/payments') return 'Gestión de Pagos';
    
    if (path === '/settings') return 'Configuración';
    
    return 'NEXUS';
  };
  
  return (
    <div className="min-h-screen bg-crm-background">
      {/* Header with fixed position and full width */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header toggleSidebar={toggleSidebar} />
      </div>
      
      <Sidebar 
        isOpen={isMobile ? mobileSidebarOpen : sidebarOpen}
        onClose={() => isMobile ? setMobileSidebarOpen(false) : setSidebarOpen(false)}
      />
      
      <main 
        className={cn(
          "pt-16 transition-all duration-300 ease-in-out min-h-screen",
          !isMobile && sidebarOpen ? "md:ml-64" : !isMobile ? "md:ml-16" : ""
        )}
      >
        <div className="p-2 md:p-4 lg:p-6">
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold">{getPageTitle()}</h1>
          </div>
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Layout;
