
import { supabase } from '@/integrations/supabase/client';

/**
 * Instagram campaign management functions
 */

export const fetchCampaigns = async (businessId?: string) => {
  let query = supabase
    .from('instagram_campaigns')
    .select('*, businesses(name)');
  
  if (businessId) {
    query = query.eq('business_id', businessId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

export const fetchCampaignById = async (id: string) => {
  const { data, error } = await supabase
    .from('instagram_campaigns')
    .select('*, businesses(name)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createCampaign = async (campaignData: {
  businessId: string;
  name: string;
  messageText: string;
  location?: string;
  reachNumbers?: number;
}) => {
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
};

export const updateCampaign = async (id: string, campaignData: any) => {
  const { data, error } = await supabase
    .from('instagram_campaigns')
    .update(campaignData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data ? data[0] : null;
};

export const deleteCampaign = async (id: string) => {
  const { error } = await supabase
    .from('instagram_campaigns')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};
