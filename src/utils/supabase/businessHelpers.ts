
import { supabase } from '@/integrations/supabase/client';

/**
 * Business management functions
 */

export const fetchBusinesses = async () => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*');
  
  if (error) throw error;
  return data || [];
};

export const fetchBusinessById = async (id: string) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createBusiness = async (businessData: any) => {
  const { data, error } = await supabase
    .from('businesses')
    .insert([businessData])
    .select();
  
  if (error) throw error;
  return data ? data[0] : null;
};

export const updateBusiness = async (id: string, businessData: any) => {
  const { data, error } = await supabase
    .from('businesses')
    .update(businessData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data ? data[0] : null;
};

export const deleteBusiness = async (id: string) => {
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};
