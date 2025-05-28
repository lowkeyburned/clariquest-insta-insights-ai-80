
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  UserPlus, 
  Shield, 
  Edit, 
  Trash2,
  Mail,
  Calendar,
  Settings
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  role: 'admin' | 'business_owner' | 'team_member';
  created_at: string;
  updated_at: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      
      return data as UserProfile[];
    }
  });

  // Fetch user roles
  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      return data as UserRole[];
    }
  });

  // Get role for a specific user
  const getUserRole = (userId: string): string => {
    const userRole = userRoles.find(role => role.user_id === userId);
    return userRole?.role || 'team_member';
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const roleColors = {
    admin: "bg-red-500",
    business_owner: "bg-blue-500", 
    team_member: "bg-green-500"
  };

  const stats = {
    totalUsers: users.length,
    admins: userRoles.filter(role => role.role === 'admin').length,
    businessOwners: userRoles.filter(role => role.role === 'business_owner').length,
    teamMembers: userRoles.filter(role => role.role === 'team_member').length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-clari-muted mt-1">
              Manage users, roles, and permissions
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <UserPlus size={16} />
              Invite User
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings size={16} />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-clari-muted">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-clari-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-clari-muted">Admins</p>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-clari-muted">Business Owners</p>
                  <p className="text-2xl font-bold">{stats.businessOwners}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-clari-muted">Team Members</p>
                  <p className="text-2xl font-bold">{stats.teamMembers}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-clari-muted" />
                <Input 
                  placeholder="Search users by email or name..." 
                  className="pl-9 border-clari-darkAccent bg-clari-darkBg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                Filter by Role
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clari-gold mx-auto"></div>
                <p className="mt-2 text-clari-muted">Loading users...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-4 bg-clari-darkBg rounded-md border border-clari-darkAccent"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-clari-gold rounded-full flex items-center justify-center">
                        <span className="text-black font-medium">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || user.email}</p>
                        <div className="flex items-center gap-2 text-sm text-clari-muted">
                          <Mail size={14} />
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge 
                        variant="outline" 
                        className={`${roleColors[getUserRole(user.id) as keyof typeof roleColors]} text-white`}
                      >
                        {getUserRole(user.id).replace('_', ' ')}
                      </Badge>
                      
                      <div className="flex items-center gap-1 text-sm text-clari-muted">
                        <Calendar size={14} />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit size={14} />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-400/10">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-clari-muted mx-auto mb-4" />
                    <p className="text-clari-muted">No users found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserManagement;
