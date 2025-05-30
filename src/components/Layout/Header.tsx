
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const { logoUrl } = useAppConfig();
  const { userData, signOut, syncUserName } = useAuth();
  const { userProfile } = useUserProfile();
  
  // Sync user name when component mounts
  React.useEffect(() => {
    syncUserName();
  }, [userProfile?.name, syncUserName]);

  // Get the display name (prioritize userProfile name over userData name)
  const displayName = userProfile?.name || userData?.name || 'Usuario';
  
  const handleSignOut = async () => {
    try {
      await signOut();
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
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="flex items-center ml-2 md:ml-0">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="h-8 max-w-32 mr-2"
                onError={(e) => {
                  // If image fails to load, show text fallback
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="bg-crm-primary rounded-md p-1">
                <h1 className="text-white text-xl font-bold px-2">N</h1>
              </div>
            )}
            <h1 className="text-crm-text ml-2 text-xl font-semibold hidden md:block">
              NEXUS
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Welcome message */}
          <span className="text-sm text-gray-600 hidden sm:block">
            Bienvenido {displayName}
          </span>
          
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          
          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
