
import { useEffect, useState } from "react";
import { LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const UserMenu = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const { checkUserRole } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const role = await checkUserRole();
        setUserRole(role);
      }
    };

    fetchUserRole();
  }, [user, checkUserRole]);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-full bg-gray-100">
        {isAdmin ? (
          <Shield size={18} className="text-blue-600" />
        ) : (
          <User size={18} className="text-gray-600" />
        )}
      </div>
      <div className="hidden md:block">
        <p className="text-sm font-medium text-gray-900">
          {isAdmin ? "Admin" : user.email}
        </p>
        {userRole && (
          <p className="text-xs text-gray-500 capitalize">
            {isAdmin ? "System Administrator" : userRole}
          </p>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="ml-2"
        onClick={signOut}
      >
        <LogOut size={16} className="mr-1" />
        Sign Out
      </Button>
    </div>
  );
};

export default UserMenu;
