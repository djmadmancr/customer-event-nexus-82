
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  
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
    if (path === '/' || path === '/dashboard') return ''; // Remove title for dashboard
    if (path === '/customers') return t('customer_management');
    if (path.includes('/customers/') && path.includes('/edit')) return t('edit_customer');
    if (path.includes('/customers/') && path.includes('/new')) return t('new_customer');
    if (path.includes('/customers/')) return t('customer_detail');
    
    if (path === '/events') return t('event_management');
    if (path.includes('/events/') && path.includes('/edit')) return t('edit_event');
    if (path.includes('/events/') && path.includes('/new')) return t('new_event');
    if (path.includes('/events/')) return t('event_detail');
    
    if (path === '/payments') return t('payment_management');
    
    if (path === '/settings') return t('settings');
    
    return 'NEXUS';
  };
  
  const pageTitle = getPageTitle();
  
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
        <div className="p-2 md:p-4 lg:p-6 max-w-full w-full">
          {pageTitle && (
            <div className="mb-4 md:mb-6">
              <h1 className="text-xl md:text-2xl font-bold">{pageTitle}</h1>
            </div>
          )}
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Layout;
