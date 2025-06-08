
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * Survey submission management functions with comprehensive error handling
 */

export const saveSurveySubmission = async (
  surveyId: string, 
  answers: Record<string, string | string[]>,
  metadata?: {
    sessionId?: string;
    userAgent?: string;
  }
): Promise<{ success: boolean; error?: string; data?: any }> => {
  if (!surveyId) {
    return { success: false, error: 'Survey ID is required' };
  }
  
  if (!answers || Object.keys(answers).length === 0) {
    return { success: false, error: 'Survey answers are required' };
  }
  
  return wrapSupabaseOperation(async () => {
    // Get current user (may be null for anonymous responses)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Create the survey response using the existing survey_responses table
    const responseData = {
      survey_id: surveyId,
      user_id: user?.id || null, // Allow null for anonymous responses
      responses: answers, // Store answers directly in the responses JSONB field
    };
    
    console.log('Saving survey submission:', responseData);
    
    const { data: submission, error: submissionError } = await supabase
      .from('survey_responses')
      .insert([responseData])
      .select()
      .single();
    
    if (submissionError) {
      console.error('Error saving survey submission:', submissionError);
      throw submissionError;
    }
    
    console.log('Survey submission saved successfully:', submission);
    
    return submission;
  }, 'Saving survey submission', 'Survey submission saved successfully!');
};

export const fetchSurveySubmissions = async (surveyId: string) => {
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
  }, `Fetching submissions for survey ${surveyId}`);
};

export const fetchAllSurveySubmissions = async () => {
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('survey_responses')
      .select(`
        *,
        survey:surveys (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }, 'Fetching all survey submissions');
};

export const fetchSurveySubmissionById = async (submissionId: string) => {
  if (!submissionId) {
    throw new Error('Submission ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('survey_responses')
      .select(`
        *,
        survey:surveys (*)
      `)
      .eq('id', submissionId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Survey submission not found');
      }
      throw error;
    }
    return data;
  }, `Fetching submission ${submissionId}`);
};

export const deleteSurveySubmission = async (submissionId: string) => {
  if (!submissionId) {
    throw new Error('Submission ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { error } = await supabase
      .from('survey_responses')
      .delete()
      .eq('id', submissionId);
    
    if (error) throw error;
    return true;
  }, `Deleting submission ${submissionId}`, 'Survey submission deleted successfully!');
};

export const getSurveySubmissionStats = async (surveyId: string) => {
  if (!surveyId) {
    throw new Error('Survey ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    // Get total submission count
    const { count: totalSubmissions, error: countError } = await supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', surveyId);
    
    if (countError) throw countError;
    
    // Get submissions by date for trend analysis
    const { data: submissionsByDate, error: trendsError } = await supabase
      .from('survey_responses')
      .select('created_at')
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: true });
    
    if (trendsError) throw trendsError;
    
    // Group by date
    const dateGroups = submissionsByDate?.reduce((acc: Record<string, number>, submission) => {
      const date = new Date(submission.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};
    
    return {
      totalSubmissions: totalSubmissions || 0,
      submissionsByDate: dateGroups,
      latestSubmissionDate: submissionsByDate?.[submissionsByDate.length - 1]?.created_at
    };
  }, `Getting stats for survey ${surveyId}`);
};
