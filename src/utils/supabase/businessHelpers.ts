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
    // First, get all surveys with their response counts
    const { data: surveysWithResponses, error } = await supabase
      .from('surveys')
      .select(`
        *,
        survey_responses(count)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform and deduplicate surveys by title, keeping the one with most responses
    const surveyMap = new Map();
    
    (surveysWithResponses || []).forEach(survey => {
      const responseCount = survey.survey_responses?.[0]?.count || 0;
      const surveyWithCount = {
        ...survey,
        response_count: responseCount
      };
      
      const existingSurvey = surveyMap.get(survey.title);
      
      if (!existingSurvey) {
        // First survey with this title
        surveyMap.set(survey.title, surveyWithCount);
      } else {
        // Survey with this title already exists, keep the one with more responses
        // If response counts are equal, keep the newer one (higher in the list due to order by created_at desc)
        if (responseCount > existingSurvey.response_count) {
          surveyMap.set(survey.title, surveyWithCount);
        }
      }
    });

    // Convert map back to array
    const uniqueSurveys = Array.from(surveyMap.values());
    
    console.log('Deduplicated surveys:', uniqueSurveys);
    
    return uniqueSurveys;
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
