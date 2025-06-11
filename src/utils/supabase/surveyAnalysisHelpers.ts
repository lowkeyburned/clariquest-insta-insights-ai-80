
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * Helper functions for survey analysis with embeddings
 */

export interface SurveySubmissionData {
  id: string;
  survey_id: string;
  survey_title: string;
  business_id: string | null;
  submission_data: any;
  raw_answers: any;
  embedding?: string; // Store as string from database
  embedding_metadata?: any;
  webhook_session_id?: string;
  processed_at: string;
  created_at: string;
  updated_at: string;
}

export interface SimilarResponse {
  id: string;
  submission_data: any;
  raw_answers: any;
  similarity: number;
  processed_at: string;
}

// Helper function to convert embedding string to number array
const parseEmbedding = (embeddingString: string | null): number[] | null => {
  if (!embeddingString) return null;
  try {
    // Remove brackets and split by comma, then convert to numbers
    const cleanString = embeddingString.replace(/^\[|\]$/g, '');
    return cleanString.split(',').map(num => parseFloat(num.trim()));
  } catch (error) {
    console.warn('Failed to parse embedding:', error);
    return null;
  }
};

export const insertSurveySubmission = async (
  surveyId: string,
  surveyTitle: string,
  businessId: string | null,
  submissionData: any,
  rawAnswers: any,
  embedding?: number[],
  webhookSessionId?: string
): Promise<{ success: boolean; error?: string; data?: SurveySubmissionData }> => {
  if (!surveyId || !surveyTitle || !submissionData || !rawAnswers) {
    return { success: false, error: 'Missing required submission data' };
  }

  return wrapSupabaseOperation(async () => {
    const insertData: any = {
      survey_id: surveyId,
      survey_title: surveyTitle,
      business_id: businessId,
      submission_data: submissionData,
      raw_answers: rawAnswers,
      webhook_session_id: webhookSessionId || null
    };

    // Add embedding if provided (convert array to vector string format)
    if (embedding && embedding.length > 0) {
      insertData.embedding = `[${embedding.join(',')}]`;
    }

    console.log('Inserting survey submission:', insertData);

    const { data, error } = await supabase
      .from('survey_submissions')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error inserting survey submission:', error);
      throw error;
    }

    console.log('Survey submission inserted successfully:', data);
    return data as SurveySubmissionData;
  }, 'Inserting survey submission', 'Survey submission saved successfully!');
};

export const getSurveySubmissions = async (surveyId: string): Promise<{ success: boolean; error?: string; data?: SurveySubmissionData[] }> => {
  if (!surveyId) {
    return { success: false, error: 'Survey ID is required' };
  }

  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('survey_submissions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('processed_at', { ascending: false });

    if (error) {
      console.error('Error fetching survey submissions:', error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} submissions for survey ${surveyId}`);
    return data as SurveySubmissionData[];
  }, `Fetching submissions for survey ${surveyId}`);
};

export const getSurveyAnalysisData = async (surveyId: string): Promise<{ success: boolean; error?: string; data?: any[] }> => {
  if (!surveyId) {
    return { success: false, error: 'Survey ID is required' };
  }

  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase.rpc('get_survey_analysis_data', {
      p_survey_id: surveyId
    });

    if (error) {
      console.error('Error getting survey analysis data:', error);
      throw error;
    }

    console.log(`Retrieved analysis data for survey ${surveyId}:`, data?.length || 0, 'records');
    return data || [];
  }, `Getting analysis data for survey ${surveyId}`);
};

export const findSimilarSurveyResponses = async (
  surveyId: string,
  queryEmbedding: number[],
  matchThreshold: number = 0.8,
  matchCount: number = 10
): Promise<{ success: boolean; error?: string; data?: SimilarResponse[] }> => {
  if (!surveyId || !queryEmbedding || queryEmbedding.length === 0) {
    return { success: false, error: 'Survey ID and query embedding are required' };
  }

  return wrapSupabaseOperation(async () => {
    // Convert embedding array to vector string format
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    const { data, error } = await supabase.rpc('find_similar_survey_responses', {
      p_survey_id: surveyId,
      p_query_embedding: embeddingString,
      p_match_threshold: matchThreshold,
      p_match_count: matchCount
    });

    if (error) {
      console.error('Error finding similar responses:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} similar responses for survey ${surveyId}`);
    return data as SimilarResponse[];
  }, `Finding similar responses for survey ${surveyId}`);
};

export const updateSubmissionEmbedding = async (
  submissionId: string,
  embedding: number[],
  metadata?: any
): Promise<{ success: boolean; error?: string; data?: SurveySubmissionData }> => {
  if (!submissionId || !embedding || embedding.length === 0) {
    return { success: false, error: 'Submission ID and embedding are required' };
  }

  return wrapSupabaseOperation(async () => {
    const updateData: any = {
      embedding: `[${embedding.join(',')}]`,
      embedding_metadata: metadata || {},
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('survey_submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating submission embedding:', error);
      throw error;
    }

    console.log('Submission embedding updated successfully:', data);
    return data as SurveySubmissionData;
  }, 'Updating submission embedding', 'Embedding updated successfully!');
};

export const getSurveySubmissionStats = async (surveyId: string): Promise<{ success: boolean; error?: string; data?: any }> => {
  if (!surveyId) {
    return { success: false, error: 'Survey ID is required' };
  }

  return wrapSupabaseOperation(async () => {
    // Get total submission count
    const { count: totalSubmissions, error: countError } = await supabase
      .from('survey_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', surveyId);

    if (countError) throw countError;

    // Get submissions with embeddings count
    const { count: embeddedSubmissions, error: embeddedError } = await supabase
      .from('survey_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', surveyId)
      .not('embedding', 'is', null);

    if (embeddedError) throw embeddedError;

    // Get latest submission date
    const { data: latestSubmission, error: latestError } = await supabase
      .from('survey_submissions')
      .select('processed_at')
      .eq('survey_id', surveyId)
      .order('processed_at', { ascending: false })
      .limit(1)
      .single();

    if (latestError && latestError.code !== 'PGRST116') throw latestError;

    return {
      totalSubmissions: totalSubmissions || 0,
      embeddedSubmissions: embeddedSubmissions || 0,
      embeddingProgress: totalSubmissions ? Math.round((embeddedSubmissions || 0) / totalSubmissions * 100) : 0,
      latestSubmissionDate: latestSubmission?.processed_at || null
    };
  }, `Getting stats for survey ${surveyId}`);
};
