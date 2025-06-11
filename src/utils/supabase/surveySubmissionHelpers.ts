
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * Survey submission functions - simplified without embeddings
 */

export const saveSurveySubmission = async (
  surveyId: string, 
  submissionData: any,
  metadata?: { sessionId?: string; userAgent?: string }
): Promise<{ success: boolean; error?: string; responseId?: string }> => {
  if (!surveyId) {
    return { success: false, error: 'Survey ID is required' };
  }
  
  if (!submissionData || typeof submissionData !== 'object') {
    return { success: false, error: 'Survey submission data is required' };
  }
  
  return wrapSupabaseOperation(async () => {
    // Get current user (may be null for anonymous responses)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Extract raw answers for easier querying
    const rawAnswers = {};
    if (submissionData.questions_and_answers) {
      submissionData.questions_and_answers.forEach((qa: any) => {
        rawAnswers[qa.question_id] = qa.answer;
      });
    }
    
    // Create the survey response with structured data for analysis
    const responseData = {
      survey_id: surveyId,
      survey_title: submissionData.survey_title || 'Untitled Survey',
      business_id: submissionData.business_id || null,
      submission_data: submissionData, // Full structured data
      raw_answers: rawAnswers, // Easy access answers
      webhook_session_id: metadata?.sessionId || null,
      user_id: user?.id || null, // Allow null for anonymous responses
    };
    
    console.log('Saving structured survey submission:', responseData);
    
    // Save to survey_submissions table
    const { data: response, error: responseError } = await supabase
      .from('survey_submissions')
      .insert([responseData])
      .select()
      .single();
    
    if (responseError) {
      console.error('Error saving survey submission:', responseError);
      throw responseError;
    }
    
    console.log('Survey submission saved successfully:', response);
    
    // Get the survey details to check for webhook URL
    const { data: surveyData, error: surveyError } = await supabase
      .from('surveys')
      .select('webhook_url, title, business_id')
      .eq('id', surveyId)
      .single();
    
    if (surveyError) {
      console.warn('Could not fetch survey webhook details:', surveyError);
    }
    
    // If there's a webhook URL configured, trigger it
    if (surveyData?.webhook_url) {
      try {
        console.log('Triggering webhook:', surveyData.webhook_url);
        
        const webhookPayload = {
          surveyId,
          responseId: response.id,
          surveyTitle: surveyData.title,
          businessId: surveyData.business_id,
          submissionData: submissionData,
          rawAnswers: rawAnswers,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            userId: user?.id || null
          }
        };
        
        // Fire and forget - don't wait for webhook response
        fetch(surveyData.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        }).catch(webhookError => {
          console.warn('Webhook call failed, but survey was saved:', webhookError);
        });
        
      } catch (webhookError) {
        console.warn('Error calling webhook, but survey was saved:', webhookError);
      }
    }
    
    return {
      success: true,
      responseId: response.id
    };
  }, 'Saving survey submission', 'Survey submission saved successfully!');
};

export const fetchSurveySubmissions = async (surveyId: string) => {
  if (!surveyId) {
    throw new Error('Survey ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('survey_submissions')
      .select(`
        *
      `)
      .eq('survey_id', surveyId)
      .order('processed_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match expected format for backward compatibility
    const transformedData = data?.map(submission => ({
      ...submission,
      submission_data: {
        raw_answers: submission.raw_answers
      }
    })) || [];
    
    return transformedData;
  }, `Fetching submissions for survey ${surveyId}`);
};

export const getSurveySubmissionStats = async (surveyId: string) => {
  if (!surveyId) {
    throw new Error('Survey ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    // Get total submission count
    const { count: totalSubmissions, error: countError } = await supabase
      .from('survey_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', surveyId);
    
    if (countError) throw countError;
    
    // Get submissions by date for trend analysis
    const { data: submissionsByDate, error: trendsError } = await supabase
      .from('survey_submissions')
      .select('processed_at')
      .eq('survey_id', surveyId)
      .order('processed_at', { ascending: true });
    
    if (trendsError) throw trendsError;
    
    // Group by date
    const dateGroups = submissionsByDate?.reduce((acc: Record<string, number>, response) => {
      const date = new Date(response.processed_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};
    
    return {
      totalSubmissions: totalSubmissions || 0,
      submissionsByDate: dateGroups,
      latestSubmissionDate: submissionsByDate?.[submissionsByDate.length - 1]?.processed_at
    };
  }, `Getting stats for survey ${surveyId}`);
};
