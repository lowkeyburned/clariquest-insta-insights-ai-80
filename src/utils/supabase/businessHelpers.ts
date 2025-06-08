
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * Business management functions with comprehensive error handling
 */

export const fetchBusinesses = async () => {
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        surveys(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Add survey count to each business
    const businessesWithCount = data?.map(business => ({
      ...business,
      survey_count: business.surveys?.[0]?.count || 0
    })) || [];

    return businessesWithCount;
  }, 'Fetching businesses');
};

export const fetchSurveysForBusiness = async (businessId: string) => {
  if (!businessId) {
    throw new Error('Business ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }, `Fetching surveys for business ${businessId}`);
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
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert([{
        name: businessData.name,
        description: businessData.description || '',
        website: businessData.website || '',
        owner_id: user.user.id
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

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
      .update({
        name: businessData.name,
        description: businessData.description,
        website: businessData.website,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

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

    if (error) {
      throw error;
    }

    return { success: true };
  }, `Deleting business ${id}`, 'Business deleted successfully!');
};
