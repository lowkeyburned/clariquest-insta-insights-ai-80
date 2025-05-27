
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * App settings management functions with comprehensive error handling
 */

export const getSetting = async (key: string) => {
  if (!key?.trim()) {
    throw new Error('Setting key is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    
    if (error) throw error;
    return data?.value;
  }, `Getting setting ${key}`);
};

export const saveSetting = async (key: string, value: string) => {
  if (!key?.trim()) {
    throw new Error('Setting key is required');
  }
  
  if (value === null || value === undefined) {
    throw new Error('Setting value is required');
  }
  
  return wrapSupabaseOperation(async () => {
    // First try to update
    const { data, error } = await supabase
      .from('settings')
      .update({ value })
      .eq('key', key)
      .select();
    
    // If no rows affected, insert instead
    if ((data && data.length === 0) || error) {
      const { data: insertData, error: insertError } = await supabase
        .from('settings')
        .insert([{ key, value }])
        .select();
      
      if (insertError) throw insertError;
      return insertData ? insertData[0] : null;
    }
    
    return data ? data[0] : null;
  }, `Saving setting ${key}`, 'Setting saved successfully!');
};
