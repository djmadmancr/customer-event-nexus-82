
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">404</h1>
          <p className="text-xl text-gray-700 mb-2">Página no encontrada</p>
          <p className="text-gray-500 mb-6">
            La página que buscas <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{location.pathname}</span> no existe o ha sido movida.
          </p>
          <div className="space-y-3 w-full">
            <Link to="/">
              <Button className="w-full flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" className="w-full">
                Ir a la página de inicio de sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
