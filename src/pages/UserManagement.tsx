
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Shield, UserPlus, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch user profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          toast({
            title: "Error",
            description: "Failed to fetch user profiles",
            variant: "destructive",
          });
          return;
        }

        if (profilesData) {
          setUsers(profilesData);
        }

        // Fetch user roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('*');

        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          toast({
            title: "Error",
            description: "Failed to fetch user roles",
            variant: "destructive",
          });
          return;
        }

        if (rolesData) {
          setUserRoles(rolesData);
        }

      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const getUserRole = (userId: string): string => {
    const userRole = userRoles.find(role => role.user_id === userId);
    return userRole?.role || 'user';
  };

  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-600';
      case 'business_owner':
        return 'bg-blue-600';
      case 'team_member':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-clari-gold animate-pulse" />
            <p className="text-lg text-clari-text">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-clari-darkBg min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-clari-text mb-2">User Management</h1>
        <p className="text-clari-muted">Manage users, roles, and permissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-clari-text">Total Users</CardTitle>
            <Users className="h-4 w-4 text-clari-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-clari-gold">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-clari-text">Admins</CardTitle>
            <Shield className="h-4 w-4 text-clari-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-clari-gold">
              {userRoles.filter(role => role.role === 'admin').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-clari-text">Business Owners</CardTitle>
            <UserPlus className="h-4 w-4 text-clari-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-clari-gold">
              {userRoles.filter(role => role.role === 'business_owner').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-clari-text">Team Members</CardTitle>
            <Settings className="h-4 w-4 text-clari-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-clari-gold">
              {userRoles.filter(role => role.role === 'team_member').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="bg-clari-darkCard border-clari-darkAccent">
        <CardHeader>
          <CardTitle className="text-clari-text">All Users</CardTitle>
          <CardDescription className="text-clari-muted">
            Manage user accounts and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-clari-darkAccent rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="bg-clari-gold text-black">
                      {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-clari-text">
                      {user.full_name || 'No name provided'}
                    </h3>
                    <p className="text-sm text-clari-muted">{user.email}</p>
                    <p className="text-xs text-clari-muted">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    className={`${getRoleColor(getUserRole(user.id))} text-white`}
                  >
                    {getUserRole(user.id)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
