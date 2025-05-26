
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  
  const toggleSidebar = () => {
    // On mobile
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      // On desktop
      setSidebarOpen(!sidebarOpen);
    }
  };
  
  // Get title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Inicio';
    if (path === '/dashboard') return 'Dashboard';
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
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar 
        isOpen={sidebarOpen} 
        mobileOpen={mobileSidebarOpen}
        toggleSidebar={toggleSidebar} 
      />
      
      <main 
        className={cn(
          "pt-16 transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:ml-64" : "md:ml-16"
        )}
      >
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
          </div>
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Layout;
