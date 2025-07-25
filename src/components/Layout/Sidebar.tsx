
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logoUrl } = useAppConfig();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const navigation = [
    { name: t('dashboard'), href: '/', icon: Home },
    { name: t('customers'), href: '/customers', icon: Users },
    { name: t('events'), href: '/events', icon: Calendar },
    { name: t('payments'), href: '/payments', icon: Coins },
  ];

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
          {/* Header */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <img 
              src="/lovable-uploads/916ae91c-50aa-4c6e-93dc-221f0254c3dd.png" 
              alt="Bassline Logo" 
              className="h-8 w-auto max-w-[150px]"
              onError={(e) => {
                // Fallback to text if image fails to load
                const textElement = document.createElement('div');
                textElement.className = 'text-xl font-bold text-crm-primary';
                textElement.textContent = 'BASSLINECRM';
                (e.currentTarget as HTMLImageElement).parentNode?.replaceChild(textElement, e.currentTarget);
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

          {/* Logo at bottom */}
          {logoUrl && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-center">
                <img 
                  src={logoUrl} 
                  alt="User Logo" 
                  className="h-12 w-auto max-w-[180px]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
