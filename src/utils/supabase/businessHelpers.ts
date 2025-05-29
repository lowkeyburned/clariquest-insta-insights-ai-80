import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * Business management functions with comprehensive error handling
 */

export const fetchBusinesses = async () => {
  return wrapSupabaseOperation(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Simple query without any role checking
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id);
    
    if (error) throw error;
    
    // Add survey count as 0 for now to avoid complex joins
    const businessesWithCount = (data || []).map(business => ({
      ...business,
      survey_count: 0
    }));
    
    return businessesWithCount;
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
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // First, ensure the user exists in the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create it
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Profile not found, creating profile for user:', user.id);
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || ''
        }]);
      
      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        throw new Error('Failed to create user profile');
      }
    } else if (profileError) {
      console.error('Error checking profile:', profileError);
      throw profileError;
    }

    // Create business with minimal data
    const businessToInsert = {
      name: businessData.name.trim(),
      description: businessData.description?.trim() || '',
      website: businessData.website?.trim() || '',
      owner_id: user.id
    };

    console.log('About to insert business:', businessToInsert);

    const { data, error } = await supabase
      .from('businesses')
      .insert([businessToInsert])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    console.log('Business inserted successfully:', data);
    return data;
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
      .select()
      .single();
    
    if (error) throw error;
    return data;
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
