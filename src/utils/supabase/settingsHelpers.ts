
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * App settings management functions - simplified to work without a settings table
 * Settings are now stored as JSON in the business description field or handled client-side
 */

export const getSetting = async (key: string) => {
  if (!key?.trim()) {
    throw new Error('Setting key is required');
  }
  
  // Since we don't have a settings table, return null or default values
  console.warn(`Settings table not available. Requested key: ${key}`);
  return null;
};

export const saveSetting = async (key: string, value: string) => {
  if (!key?.trim()) {
    throw new Error('Setting key is required');
  }
  
  if (value === null || value === undefined) {
    throw new Error('Setting value is required');
  }
  
  // Since we don't have a settings table, log the attempt
  console.warn(`Settings table not available. Cannot save key: ${key}, value: ${value}`);
  return null;
};
