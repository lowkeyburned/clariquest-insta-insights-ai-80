
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * Business management functions with comprehensive error handling
 */

export const fetchBusinesses = async () => {
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }, 'Fetching businesses');
};

export const fetchBusinessById = async (id: string) => {
  if (!id) {
    throw new Error('Business ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Business not found');
      }
      throw error;
    }
    return data;
  }, `Fetching business ${id}`);
};

export const createBusiness = async (businessData: any) => {
  if (!businessData?.name?.trim()) {
    throw new Error('Business name is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('businesses')
      .insert([businessData])
      .select();
    
    if (error) throw error;
    return data ? data[0] : null;
  }, 'Creating business', 'Business created successfully!');
};

export const updateBusiness = async (id: string, businessData: any) => {
  if (!id) {
    throw new Error('Business ID is required');
  }
  
  if (!businessData || Object.keys(businessData).length === 0) {
    throw new Error('Business data is required for update');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('businesses')
      .update(businessData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Business not found or no changes made');
    }
    return data[0];
  }, `Updating business ${id}`, 'Business updated successfully!');
};

export const deleteBusiness = async (id: string) => {
  if (!id) {
    throw new Error('Business ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }, `Deleting business ${id}`, 'Business deleted successfully!');
};
