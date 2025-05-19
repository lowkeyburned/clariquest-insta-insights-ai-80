
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const { toast } = useToast();
  
  // Check if user is authenticated
  const checkAuth = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create surveys",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return { checkAuth };
};
