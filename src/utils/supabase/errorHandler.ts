
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export interface SupabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}

export const handleSupabaseError = (error: any, context: string = 'Database operation') => {
  console.error(`[${context}] Supabase error:`, error);
  
  // Extract meaningful error message
  let userMessage = 'An unexpected error occurred. Please try again.';
  
  if (error?.message) {
    // Handle common Supabase error patterns
    if (error.message.includes('duplicate key')) {
      userMessage = 'This record already exists. Please use a different value.';
    } else if (error.message.includes('foreign key')) {
      userMessage = 'Cannot complete this action due to related data constraints.';
    } else if (error.message.includes('not found')) {
      userMessage = 'The requested item was not found.';
    } else if (error.message.includes('permission denied') || error.message.includes('RLS')) {
      userMessage = 'You do not have permission to perform this action.';
    } else if (error.message.includes('connection')) {
      userMessage = 'Connection error. Please check your internet connection and try again.';
    } else if (error.message.includes('timeout')) {
      userMessage = 'The operation took too long. Please try again.';
    } else {
      userMessage = error.message;
    }
  }
  
  // Show user-friendly toast notification
  toast({
    title: "Error",
    description: userMessage,
    variant: "destructive",
  });
  
  // Return structured error for further handling
  return {
    success: false,
    error: userMessage,
    originalError: error
  };
};

export const wrapSupabaseOperation = async <T>(
  operation: () => Promise<T>,
  context: string,
  showSuccessMessage?: string
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const result = await operation();
    
    if (showSuccessMessage) {
      toast({
        title: "Success",
        description: showSuccessMessage,
      });
    }
    
    return { success: true, data: result };
  } catch (error) {
    const errorResult = handleSupabaseError(error, context);
    return errorResult;
  }
};
