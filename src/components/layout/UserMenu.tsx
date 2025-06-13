
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const UserMenu = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <User size={18} className="text-gray-600" />
        <span className="text-sm text-gray-700">{user.email}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={signOut}
        className="gap-2"
      >
        <LogOut size={16} />
        Sign Out
      </Button>
    </div>
  );
};

export default UserMenu;
