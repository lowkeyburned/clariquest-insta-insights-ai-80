
import { supabase } from '@/integrations/supabase/client';

/**
 * App settings management functions
 */

export const getSetting = async (key: string) => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  
  if (error) throw error;
  return data?.value;
};

export const saveSetting = async (key: string, value: string) => {
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
};
