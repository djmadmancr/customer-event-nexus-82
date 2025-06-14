
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User, CalendarPlus, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { currentUser, signOut, userData } = useAuth();
  const { logoUrl } = useAppConfig();
  const { userProfile } = useUserProfile();
  const { t } = useLanguage();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCopyBookingLink = () => {
    if (currentUser) {
      const bookingUrl = `${window.location.origin}/booking/${currentUser.uid}`;
      navigator.clipboard.writeText(bookingUrl);
      toast({
        title: t("booking_link_copied"),
        description: t("booking_link_copied"),
      });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4">
        {/* Mobile menu button */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo Section */}
        <div className={`flex-1 flex ${isMobile ? 'justify-center' : 'justify-center'}`}>
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt="Logo" 
              className={`${isMobile ? 'h-8 w-auto max-w-[150px]' : 'h-12 w-auto max-w-[200px]'}`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-1 md:space-x-2">
          {currentUser && (
            <>
              {!isMobile && (
                <Button variant="ghost" onClick={handleCopyBookingLink} className="hidden sm:flex">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  {t("booking")}
                </Button>
              )}
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`flex items-center ${isMobile ? 'px-2' : 'space-x-2'}`}>
                    <User className="h-4 w-4" />
                    {!isMobile && (
                      <span className="hidden sm:inline">
                        {userData?.name || userProfile?.name || currentUser.email}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {isMobile && (
                    <>
                      <DropdownMenuItem onClick={handleCopyBookingLink}>
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        {t("booking")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t("settings")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
