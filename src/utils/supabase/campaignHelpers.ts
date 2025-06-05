
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * Instagram campaign management functions with comprehensive error handling
 */

export const fetchInstagramCampaigns = async (businessId?: string) => {
  return wrapSupabaseOperation(async () => {
    let query = supabase
      .from('instagram_campaigns')
      .select(`
        *,
        targets:campaign_targets (*),
        analytics:campaign_analytics (*),
        survey_links:campaign_survey_links (*)
      `)
      .order('created_at', { ascending: false });
    
    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }, businessId ? `Fetching Instagram campaigns for business ${businessId}` : 'Fetching all Instagram campaigns');
};

export const createInstagramCampaign = async (campaignData: {
  business_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  created_by: string;
  survey_link?: string;
  target_location?: string;
  reach_numbers?: number;
  message_content?: string;
}) => {
  if (!campaignData.business_id) {
    throw new Error('Business ID is required');
  }
  
  if (!campaignData.name?.trim()) {
    throw new Error('Campaign name is required');
  }
  
  if (!campaignData.start_date) {
    throw new Error('Start date is required');
  }
  
  if (!campaignData.created_by) {
    throw new Error('Created by user ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('instagram_campaigns')
      .insert([{
        business_id: campaignData.business_id,
        name: campaignData.name,
        description: campaignData.description,
        start_date: campaignData.start_date,
        end_date: campaignData.end_date,
        created_by: campaignData.created_by,
        survey_link: campaignData.survey_link,
        target_location: campaignData.target_location,
        reach_numbers: campaignData.reach_numbers,
        message_content: campaignData.message_content
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }, 'Creating Instagram campaign', 'Instagram campaign created successfully!');
};

export const updateInstagramCampaign = async (id: string, updates: any) => {
  if (!id) {
    throw new Error('Campaign ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('instagram_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }, `Updating Instagram campaign ${id}`, 'Instagram campaign updated successfully!');
};

export const deleteInstagramCampaign = async (id: string) => {
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
  }, `Deleting Instagram campaign ${id}`, 'Instagram campaign deleted successfully!');
};

export const addCampaignTarget = async (campaignId: string, targetData: {
  target_user_id: string;
  target_data?: Record<string, any>;
}) => {
  if (!campaignId) {
    throw new Error('Campaign ID is required');
  }
  
  if (!targetData.target_user_id) {
    throw new Error('Target user ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('campaign_targets')
      .insert([{
        campaign_id: campaignId,
        target_user_id: targetData.target_user_id,
        target_data: targetData.target_data
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }, `Adding target to campaign ${campaignId}`, 'Campaign target added successfully!');
};

export const linkSurveyToCampaign = async (campaignId: string, surveyId: string, surveyLink: string) => {
  if (!campaignId) {
    throw new Error('Campaign ID is required');
  }
  
  if (!surveyId) {
    throw new Error('Survey ID is required');
  }
  
  if (!surveyLink) {
    throw new Error('Survey link is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('campaign_survey_links')
      .insert([{
        campaign_id: campaignId,
        survey_id: surveyId,
        survey_link: surveyLink
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }, `Linking survey to campaign ${campaignId}`, 'Survey linked to campaign successfully!');
};

export const addCampaignAnalytics = async (campaignId: string, analyticsData: {
  metrics: Record<string, any>;
  date: string;
  engagement_data?: Record<string, any>;
}) => {
  if (!campaignId) {
    throw new Error('Campaign ID is required');
  }
  
  if (!analyticsData.metrics) {
    throw new Error('Metrics data is required');
  }
  
  if (!analyticsData.date) {
    throw new Error('Date is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('campaign_analytics')
      .insert([{
        campaign_id: campaignId,
        metrics: analyticsData.metrics,
        date: analyticsData.date,
        engagement_data: analyticsData.engagement_data
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }, `Adding analytics to campaign ${campaignId}`, 'Campaign analytics added successfully!');
};

export const getCampaignAnalytics = async (campaignId: string) => {
  if (!campaignId) {
    throw new Error('Campaign ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('campaign_analytics')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }, `Fetching analytics for campaign ${campaignId}`);
};

export const getCampaignTargets = async (campaignId: string) => {
  if (!campaignId) {
    throw new Error('Campaign ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('campaign_targets')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }, `Fetching targets for campaign ${campaignId}`);
};

export const getCampaignSurveyLinks = async (campaignId: string) => {
  if (!campaignId) {
    throw new Error('Campaign ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('campaign_survey_links')
      .select(`
        *,
        survey:surveys (*)
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }, `Fetching survey links for campaign ${campaignId}`);
};
