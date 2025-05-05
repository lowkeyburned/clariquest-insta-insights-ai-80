
import { useEffect, useState } from "react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const UserMenu = () => {
  const { user, signOut } = useAuth();
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
    <div className="mt-auto p-4 border-t border-clari-darkAccent">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-full bg-clari-darkAccent">
          <User size={18} className="text-clari-gold" />
        </div>
        <div>
          <p className="text-sm truncate w-44">{user.email}</p>
          {userRole && (
            <p className="text-xs text-clari-gold capitalize">{userRole}</p>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-sm justify-start gap-2"
        onClick={signOut}
      >
        <LogOut size={16} />
        Sign Out
      </Button>
    </div>
  );
};

export default UserMenu;
