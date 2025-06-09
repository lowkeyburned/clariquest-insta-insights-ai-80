
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * App settings management functions - now working with the settings table
 */

export const getSetting = async (key: string) => {
  if (!key?.trim()) {
    throw new Error('Setting key is required');
  }
  
  return wrapSupabaseOperation(async () => {
    console.log('Getting setting:', key);
    
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting setting:', error);
      throw error;
    }
    
    console.log('Setting retrieved:', { key, value: data?.value });
    return data?.value || null;
  }, `Getting setting: ${key}`, 'Setting retrieved successfully!');
};

export const saveSetting = async (key: string, value: string) => {
  if (!key?.trim()) {
    throw new Error('Setting key is required');
  }
  
  if (value === null || value === undefined) {
    throw new Error('Setting value is required');
  }
  
  return wrapSupabaseOperation(async () => {
    console.log('Saving setting:', { key, value });
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Use upsert to either insert or update the setting
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        key,
        value,
        user_id: user?.id || null,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('Error saving setting:', error);
      throw error;
    }
    
    console.log('Setting saved successfully:', data);
    return data;
  }, `Saving setting: ${key}`, 'Setting saved successfully!');
};
