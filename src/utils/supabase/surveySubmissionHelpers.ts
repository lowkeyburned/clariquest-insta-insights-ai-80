
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
    
    // Get the survey to extract questions for structured data
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select(`
        id,
        title,
        questions:survey_questions(
          id,
          question_text,
          question_type,
          options
        )
      `)
      .eq('id', surveyId)
      .single();

    if (surveyError) {
      console.error('Error fetching survey for submission:', surveyError);
    }

    // Structure the submission data with question details
    const submissionData = {
      survey_id: surveyId,
      survey_title: survey?.title || 'Unknown Survey',
      questions_and_answers: (survey?.questions || []).map((question: any) => ({
        question_id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        answer: answers[question.id] || null
      })),
      raw_answers: answers,
      submission_timestamp: new Date().toISOString()
    };
    
    // Create the survey submission
    const responseData = {
      survey_id: surveyId,
      user_id: user?.id || null, // Allow null for anonymous responses
      submission_data: submissionData,
      session_id: metadata?.sessionId || null,
      user_agent: metadata?.userAgent || null,
    };
    
    console.log('Saving survey submission:', responseData);
    
    const { data: submission, error: submissionError } = await supabase
      .from('survey_submissions')
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
      .from('survey_submissions')
      .select(`
        *
      `)
      .eq('survey_id', surveyId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }, `Fetching submissions for survey ${surveyId}`);
};

export const fetchAllSurveySubmissions = async () => {
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('survey_submissions_with_details')
      .select('*')
      .order('submitted_at', { ascending: false });
    
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
      .from('survey_submissions')
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
      .from('survey_submissions')
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
      .from('survey_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', surveyId);
    
    if (countError) throw countError;
    
    // Get submissions by date for trend analysis
    const { data: submissionsByDate, error: trendsError } = await supabase
      .from('survey_submissions')
      .select('submitted_at')
      .eq('survey_id', surveyId)
      .order('submitted_at', { ascending: true });
    
    if (trendsError) throw trendsError;
    
    // Group by date
    const dateGroups = submissionsByDate?.reduce((acc: Record<string, number>, submission) => {
      const date = new Date(submission.submitted_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};
    
    return {
      totalSubmissions: totalSubmissions || 0,
      submissionsByDate: dateGroups,
      latestSubmissionDate: submissionsByDate?.[submissionsByDate.length - 1]?.submitted_at
    };
  }, `Getting stats for survey ${surveyId}`);
};
