
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  requireAdmin?: boolean; // Add this property to support legacy code
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireAdmin = false // Default to false
}) => {
  const { currentUser, userRole, loading } = useAuth();
  const { toast } = useToast();
  
  // If requireAdmin is true, set requiredRole to 'admin' for backward compatibility
  const effectiveRole = requireAdmin ? 'admin' : requiredRole;

  useEffect(() => {
    if (!loading && currentUser && effectiveRole && userRole !== effectiveRole) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a esta sección.",
        variant: "destructive",
      });
    }
  }, [currentUser, loading, effectiveRole, userRole, toast]);

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
  if (effectiveRole && userRole !== effectiveRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
