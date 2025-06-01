import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkUserRole: () => Promise<string | null>;
  makeUserAdmin: (userId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if user is admin
        if (session?.user) {
          const role = await checkUserRole();
          setIsAdmin(role === 'admin');
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        toast({
          title: "Session Error",
          description: "Failed to retrieve session. Please try logging in again.",
          variant: "destructive",
        });
      }
      console.log('Initial session:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if user is admin
      if (session?.user) {
        const role = await checkUserRole();
        setIsAdmin(role === 'admin');
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signIn = async (username: string, password: string) => {
    if (!username?.trim() || !password?.trim()) {
      throw new Error('Username and password are required');
    }
    
    try {
      // Check for hardcoded admin credentials
      if (username === "Admin" && password === "Hehehe@3.") {
        // Create admin session manually
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: "admin@clariquest.com", 
          password: "admin123456" 
        });
        
        if (error) {
          // If admin account doesn't exist, create it
          const { error: signUpError } = await supabase.auth.signUp({
            email: "admin@clariquest.com",
            password: "admin123456"
          });
          
          if (!signUpError) {
            // Sign in after creation
            await supabase.auth.signInWithPassword({ 
              email: "admin@clariquest.com", 
              password: "admin123456" 
            });
          }
        }
        
        toast({
          title: "Welcome Admin!",
          description: "You have full access to the system.",
        });
        return;
      }
      
      // For regular users, try to sign in with username as email first
      // If username doesn't contain @, add a dummy domain for Supabase
      const emailToUse = username.includes('@') ? username : `${username}@dummy.com`;
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: emailToUse, 
        password 
      });
      if (error) throw error;
      
      console.log('Sign in successful, session data:', data);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.message || 'An unexpected error occurred during sign in';
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (username: string, password: string) => {
    if (!username?.trim() || !password?.trim()) {
      throw new Error('Username and password are required');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    try {
      // For signup, if username doesn't contain @, add a dummy domain
      const emailToUse = username.includes('@') ? username : `${username}@dummy.com`;
      
      const { error } = await supabase.auth.signUp({ 
        email: emailToUse, 
        password 
      });
      if (error) throw error;
      
      toast({
        title: "Sign up successful",
        description: "Please check your email for confirmation.",
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMessage = error.message || 'An unexpected error occurred during sign up';
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: error.message || 'An unexpected error occurred during sign out',
        variant: "destructive",
      });
    }
  };

  const checkUserRole = async () => {
    if (!user) {
      console.warn('No user found when checking role');
      return null;
    }
    
    // Check if this is the admin user
    if (user.email === "admin@clariquest.com") {
      return 'admin';
    }
    
    try {
      // Use the new security definer function instead of direct query
      const { data, error } = await supabase.rpc('get_user_role', {
        user_id: user.id
      });
      
      if (error) {
        console.error("Error checking user role:", error);
        toast({
          title: "Error",
          description: "Failed to check user permissions",
          variant: "destructive",
        });
        return null;
      }
      
      return data || null;
    } catch (error) {
      console.error("Unexpected error checking user role:", error);
      return null;
    }
  };

  const makeUserAdmin = async (userId: string) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    try {
      // Check if user already has a role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) throw checkError;

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: 'admin' })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "User has been made an admin",
      });
    } catch (error: any) {
      console.error('Make user admin error:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update user role',
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      isAdmin,
      signIn, 
      signUp, 
      signOut, 
      checkUserRole,
      makeUserAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
