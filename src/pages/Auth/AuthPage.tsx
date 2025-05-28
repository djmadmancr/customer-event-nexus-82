
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Login from './Login';
import Register from './Register';

const AuthPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            NEXUS CRM
          </h1>
          <p className="text-sm text-gray-600">
            Sistema de Gestión de Eventos
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                className={`w-1/2 py-2 px-1 text-center text-sm font-medium ${
                  isLogin
                    ? 'border-b-2 border-crm-primary text-crm-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setIsLogin(true)}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                className={`w-1/2 py-2 px-1 text-center text-sm font-medium ${
                  !isLogin
                    ? 'border-b-2 border-crm-primary text-crm-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
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
        </div>

        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500">
            <strong>Credenciales de prueba:</strong><br />
            Admin: admin@ejemplo.com / admin123<br />
            Usuario: usuario@ejemplo.com / usuario123
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
