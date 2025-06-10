
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';
import Login from './Login';
import Register from './Register';

const AuthPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showAdminLink, setShowAdminLink] = useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <img 
            src="./logo.png" 
            alt="Bassline Logo" 
            className={cn(
              "mx-auto mb-4",
              isMobile ? "h-8 w-auto max-w-[150px]" : "h-12 w-auto max-w-[200px]"
            )}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <p className={cn(
            "text-gray-600",
            isMobile ? "text-xs" : "text-sm"
          )}>
            Sistema de Gestión de Eventos
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-10 shadow rounded-lg sm:rounded-lg">
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                className={cn(
                  "w-1/2 py-2 px-1 text-center font-medium",
                  isMobile ? "text-xs" : "text-sm",
                  isLogin
                    ? 'border-b-2 border-crm-primary text-crm-primary'
                    : 'text-gray-500 hover:text-gray-700'
                )}
                onClick={() => setIsLogin(true)}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                className={cn(
                  "w-1/2 py-2 px-1 text-center font-medium",
                  isMobile ? "text-xs" : "text-sm",
                  !isLogin
                    ? 'border-b-2 border-crm-primary text-crm-primary'
                    : 'text-gray-500 hover:text-gray-700'
                )}
                onClick={() => setIsLogin(false)}
              >
                Registrarse
              </button>
            </div>
          </div>

          {isLogin ? (
            <Login onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <Register onSwitchToLogin={() => setIsLogin(true)} />
          )}

          {/* Admin Dashboard Link */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Shield className="h-4 w-4" />
              Acceso Panel de Administración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
