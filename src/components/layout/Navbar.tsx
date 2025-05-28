
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Instagram,
  Building2,
  Users
} from "lucide-react";
import UserMenu from "@/components/auth/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { user, checkUserRole } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const role = await checkUserRole();
        setIsAdmin(role === "admin");
      }
    };
    
    checkAdminStatus();
  }, [user, checkUserRole]);

  return (
    <nav className="fixed top-0 left-0 w-64 h-screen bg-clari-darkCard border-r border-clari-darkAccent flex flex-col">
      <div className="p-4 border-b border-clari-darkAccent">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/615648e6-9fc9-4b7b-937c-7345916fe34a.png" 
            alt="Clariquest Logo" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-xl font-bold text-clari-gold">Clariquest</h1>
        </Link>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-xs text-clari-muted mb-4 uppercase font-semibold">Main Menu</p>
        <ul className="space-y-2">
          <li>
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start gap-2 text-left">
                <LayoutDashboard size={18} />
                Dashboard
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/businesses">
              <Button variant="ghost" className="w-full justify-start gap-2 text-left">
                <Building2 size={18} />
                Businesses
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/instagram-campaigns">
              <Button variant="ghost" className="w-full justify-start gap-2 text-left">
                <Instagram size={18} />
                Instagram Campaigns
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/ai-insights">
              <Button variant="ghost" className="w-full justify-start gap-2 text-left">
                <BrainCircuit size={18} />
                AI Insights
              </Button>
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/user-management">
                <Button variant="ghost" className="w-full justify-start gap-2 text-left">
                  <Users size={18} />
                  User Management
                </Button>
              </Link>
            </li>
          )}
        </ul>
      </div>
      <UserMenu />
    </nav>
  );
};

export default Navbar;
