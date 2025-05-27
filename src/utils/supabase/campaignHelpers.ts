
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * Instagram campaign management functions with comprehensive error handling
 */

export const fetchCampaigns = async (businessId?: string) => {
  return wrapSupabaseOperation(async () => {
    let query = supabase
      .from('instagram_campaigns')
      .select('*, businesses(name)');
    
    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }, businessId ? `Fetching campaigns for business ${businessId}` : 'Fetching all campaigns');
};

export const fetchCampaignById = async (id: string) => {
  if (!id) {
    throw new Error('Campaign ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('instagram_campaigns')
      .select('*, businesses(name)')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Campaign not found');
      }
      throw error;
    }
    return data;
  }, `Fetching campaign ${id}`);
};

export const createCampaign = async (campaignData: {
  businessId: string;
  name: string;
  messageText: string;
  location?: string;
  reachNumbers?: number;
}) => {
  if (!campaignData?.businessId) {
    throw new Error('Business ID is required');
  }
  
  if (!campaignData?.name?.trim()) {
    throw new Error('Campaign name is required');
  }
  
  if (!campaignData?.messageText?.trim()) {
    throw new Error('Campaign message is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('instagram_campaigns')
      .insert([{
        business_id: campaignData.businessId,
        name: campaignData.name,
        message_text: campaignData.messageText,
        location: campaignData.location,
        reach_numbers: campaignData.reachNumbers
      }])
      .select();
    
    if (error) throw error;
    return data ? data[0] : null;
  }, 'Creating campaign', 'Campaign created successfully!');
};

export const updateCampaign = async (id: string, campaignData: any) => {
  if (!id) {
    throw new Error('Campaign ID is required');
  }
  
  if (!campaignData || Object.keys(campaignData).length === 0) {
    throw new Error('Campaign data is required for update');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('instagram_campaigns')
      .update(campaignData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Campaign not found or no changes made');
    }
    return data[0];
  }, `Updating campaign ${id}`, 'Campaign updated successfully!');
};

export const deleteCampaign = async (id: string) => {
  if (!id) {
    throw new Error('Campaign ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { error } = await supabase
      .from('instagram_campaigns')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }, `Deleting campaign ${id}`, 'Campaign deleted successfully!');
};
