
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * Survey response management functions with comprehensive error handling
 */

export const saveSurveyResponse = async (
  surveyId: string, 
  answers: Record<string, string | string[]>
): Promise<{ success: boolean; error?: string }> => {
  if (!surveyId) {
    return { success: false, error: 'Survey ID is required' };
  }
  
  if (!answers || Object.keys(answers).length === 0) {
    return { success: false, error: 'Survey answers are required' };
  }
  
  return wrapSupabaseOperation(async () => {
    // Get current user (may be null for anonymous responses)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Create the survey response with proper user_id handling
    const responseData = {
      survey_id: surveyId,
      user_id: user?.id || null, // Allow null for anonymous responses
      responses: answers,
    };
    
    console.log('Saving survey response:', responseData);
    
    const { data: response, error: responseError } = await supabase
      .from('survey_responses')
      .insert([responseData])
      .select()
      .single();
    
    if (responseError) {
      console.error('Error saving survey response:', responseError);
      throw responseError;
    }
    
    console.log('Survey response saved successfully:', response);
    
    // Note: We no longer save individual answer records since response_answers table was removed
    // All answers are stored in the responses JSON field
    
    return response;
  }, 'Saving survey response', 'Survey response saved successfully!');
};

export const fetchSurveyResponses = async (surveyId: string) => {
  if (!surveyId) {
    throw new Error('Survey ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('survey_responses')
      .select(`
        *
      `)
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }, `Fetching responses for survey ${surveyId}`);
};

export const fetchSurveyResponseById = async (responseId: string) => {
  if (!responseId) {
    throw new Error('Response ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('survey_responses')
      .select(`
        *,
        survey:surveys (*)
      `)
      .eq('id', responseId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Survey response not found');
      }
      throw error;
    }
    return data;
  }, `Fetching response ${responseId}`);
};

export const deleteSurveyResponse = async (responseId: string) => {
  if (!responseId) {
    throw new Error('Response ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { error } = await supabase
      .from('survey_responses')
      .delete()
      .eq('id', responseId);
    
    if (error) throw error;
    return true;
  }, `Deleting response ${responseId}`, 'Survey response deleted successfully!');
};

export const getSurveyResponseStats = async (surveyId: string) => {
  if (!surveyId) {
    throw new Error('Survey ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    // Get total response count
    const { count: totalResponses, error: countError } = await supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', surveyId);
    
    if (countError) throw countError;
    
    // Get responses by date for trend analysis
    const { data: responsesByDate, error: trendsError } = await supabase
      .from('survey_responses')
      .select('created_at')
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: true });
    
    if (trendsError) throw trendsError;
    
    // Group by date
    const dateGroups = responsesByDate?.reduce((acc: Record<string, number>, response) => {
      const date = new Date(response.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};
    
    return {
      totalResponses: totalResponses || 0,
      responsesByDate: dateGroups,
      latestResponseDate: responsesByDate?.[responsesByDate.length - 1]?.created_at
    };
  }, `Getting stats for survey ${surveyId}`);
};
