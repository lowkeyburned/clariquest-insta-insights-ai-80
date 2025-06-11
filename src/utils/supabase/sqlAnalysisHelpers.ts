
import { supabase } from '@/integrations/supabase/client';

/**
 * SQL Analysis helpers for survey data - designed to work with your n8n workflow
 */

export const executeCustomQuery = async (query: string) => {
  try {
    const { data, error } = await supabase.rpc('execute_sql', { query_text: query });
    
    if (error) {
      console.error('SQL Query Error:', error);
      throw error;
    }
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Failed to execute query:', error);
    return { success: false, data: null, error: error.message };
  }
};

// Pre-built analysis queries for common use cases
export const surveyAnalysisQueries = {
  // Get all survey responses with question-answer pairs
  getAllResponsesWithQuestions: (surveyId: string) => `
    SELECT 
      id,
      survey_title,
      submission_data->>'questions_and_answers' as questions_and_answers,
      raw_answers,
      submission_data->'submission_metadata'->>'completion_rate' as completion_rate,
      processed_at
    FROM survey_submissions 
    WHERE survey_id = '${surveyId}'
    ORDER BY processed_at DESC;
  `,

  // Get response statistics
  getResponseStatistics: (surveyId: string) => `
    SELECT 
      COUNT(*) as total_responses,
      AVG((submission_data->'submission_metadata'->>'completion_rate')::integer) as avg_completion_rate,
      COUNT(CASE WHEN (submission_data->'submission_metadata'->>'completion_rate')::integer = 100 THEN 1 END) as fully_completed,
      MIN(processed_at) as first_response,
      MAX(processed_at) as latest_response
    FROM survey_submissions 
    WHERE survey_id = '${surveyId}';
  `,

  // Get answers for a specific question
  getAnswersForQuestion: (surveyId: string, questionId: string) => `
    SELECT 
      id,
      raw_answers->>'${questionId}' as answer,
      processed_at
    FROM survey_submissions 
    WHERE survey_id = '${surveyId}' 
    AND raw_answers->>'${questionId}' IS NOT NULL
    ORDER BY processed_at DESC;
  `,

  // Get question text and answer distribution
  getQuestionAnalysis: (surveyId: string) => `
    SELECT 
      jsonb_array_elements(submission_data->'questions_and_answers')->>'question_text' as question_text,
      jsonb_array_elements(submission_data->'questions_and_answers')->>'question_type' as question_type,
      jsonb_array_elements(submission_data->'questions_and_answers')->>'answer' as answer,
      COUNT(*) as frequency
    FROM survey_submissions 
    WHERE survey_id = '${surveyId}'
    GROUP BY question_text, question_type, answer
    ORDER BY question_text, frequency DESC;
  `,

  // Get completion trends by date
  getCompletionTrends: (surveyId: string) => `
    SELECT 
      DATE(processed_at) as response_date,
      COUNT(*) as responses_count,
      AVG((submission_data->'submission_metadata'->>'completion_rate')::integer) as avg_completion_rate
    FROM survey_submissions 
    WHERE survey_id = '${surveyId}'
    GROUP BY DATE(processed_at)
    ORDER BY response_date DESC;
  `
};

// Example usage function for your AI workflow
export const getSurveyAnalysisForAI = async (surveyId: string) => {
  try {
    // Get all structured data for AI analysis
    const { data, error } = await supabase
      .from('survey_submissions')
      .select(`
        id,
        survey_title,
        submission_data,
        raw_answers,
        processed_at,
        business_id
      `)
      .eq('survey_id', surveyId)
      .order('processed_at', { ascending: false });

    if (error) throw error;

    // Structure for AI analysis
    const analysisData = {
      survey_id: surveyId,
      total_responses: data?.length || 0,
      responses: data?.map(response => ({
        response_id: response.id,
        submitted_at: response.processed_at,
        questions_and_answers: response.submission_data?.questions_and_answers || [],
        raw_answers: response.raw_answers || {},
        completion_rate: response.submission_data?.submission_metadata?.completion_rate || 0
      })) || []
    };

    return { success: true, data: analysisData, error: null };
  } catch (error) {
    console.error('Error getting survey analysis data:', error);
    return { success: false, data: null, error: error.message };
  }
};
