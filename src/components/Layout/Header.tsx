
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Bell, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { AppSettings } from '@/types/models';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const { currentUser, userData, userRole, signOut } = useAuth();
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = doc(firestore, 'settings', 'appSettings');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          setAppSettings({
            id: settingsSnap.id,
            ...settingsSnap.data()
          } as AppSettings);
        }
      } catch (error) {
        console.error('Error loading app settings:', error);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <header className="bg-white shadow-sm border-b h-16 flex items-center px-4 fixed top-0 left-0 w-full z-30">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="md:flex hidden"
            title={sidebarOpen ? "Colapsar menú" : "Expandir menú"}
          >
            {sidebarOpen ? 
              <ChevronLeft className="h-5 w-5" /> : 
              <ChevronRight className="h-5 w-5" />
            }
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="md:hidden block"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="flex items-center ml-2 md:ml-0">
            {appSettings?.logoUrl ? (
              <img 
                src={appSettings.logoUrl} 
                alt="Logo" 
                className="h-8 max-w-32 mr-2"
                onError={(e) => {
                  // If image fails to load, show text fallback
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="bg-crm-primary rounded-md p-1">
                <h1 className="text-white text-xl font-bold px-2">CRM</h1>
              </div>
            )}
            <h1 className="text-crm-text ml-2 text-xl font-semibold hidden md:block">
              {appSettings?.appName || 'Sistema de Gestión'}
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {currentUser ? (
                <>
                  <DropdownMenuLabel>
                    {userData?.name || currentUser.email}
                    {userRole === 'admin' && (
                      <Badge variant="secondary" className="ml-2">Admin</Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userRole === 'admin' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                        Panel de Administración
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                        Gestión de Usuarios
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    Cerrar Sesión
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => navigate('/login')}>
                    Iniciar Sesión
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/register')}>
                    Registrarse
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
