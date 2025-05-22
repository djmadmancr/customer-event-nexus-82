
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Bell, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  
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
            <div className="bg-crm-primary rounded-md p-1">
              <h1 className="text-white text-xl font-bold px-2">CRM</h1>
            </div>
            <h1 className="text-crm-text ml-2 text-xl font-semibold hidden md:block">
              Sistema de Gestión
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
