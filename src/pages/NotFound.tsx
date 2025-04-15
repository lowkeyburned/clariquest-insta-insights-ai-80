
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-clari-darkBg text-clari-text">
      <div className="text-center">
        <h1 className="text-8xl font-bold mb-4 text-clari-gold">404</h1>
        <p className="text-2xl mb-6">Page not found</p>
        <p className="text-clari-muted mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
          <Link to="/">
            <Home size={16} />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
