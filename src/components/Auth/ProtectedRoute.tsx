
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { currentUser, userRole, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && currentUser && requiredRole && userRole !== requiredRole) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a esta sección.",
        variant: "destructive",
      });
    }
  }, [currentUser, loading, requiredRole, userRole, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crm-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and the user doesn't have it
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
