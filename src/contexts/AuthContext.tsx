
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  userRole: string | null;
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
  const [userRole, setUserRole] = useState<string | null>(null);
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
          setUserRole(role);
        } else {
          setIsAdmin(false);
          setUserRole(null);
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
        setUserRole(role);
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
    
    // Since we cleared the database, there are no user roles to check
    // Return null for now until the user roles system is rebuilt
    console.warn('User roles system not available - database was cleared');
    return null;
  };

  const makeUserAdmin = async (userId: string) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Since we cleared the database, this function can't work
    // Show a message to the user that the user roles system needs to be rebuilt
    toast({
      title: "Feature Unavailable",
      description: "User roles system needs to be rebuilt after database reset",
      variant: "destructive",
    });
    throw new Error('User roles system not available - database was cleared');
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      isAdmin,
      userRole,
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
