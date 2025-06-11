
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * Survey submission functions with webhook integration for embeddings
 */

export const saveSurveySubmission = async (
  surveyId: string, 
  answers: Record<string, string | string[]>,
  metadata?: { sessionId?: string; userAgent?: string }
): Promise<{ success: boolean; error?: string; responseId?: string }> => {
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
      embedding_status: 'pending' // Mark for embedding processing
    };
    
    console.log('Saving survey submission:', responseData);
    
    const { data: response, error: responseError } = await supabase
      .from('survey_responses')
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
    
    // If there's a webhook URL configured, trigger it for embedding processing
    if (surveyData?.webhook_url) {
      try {
        console.log('Triggering webhook for embedding processing:', surveyData.webhook_url);
        
        const webhookPayload = {
          surveyId,
          responseId: response.id,
          surveyTitle: surveyData.title,
          businessId: surveyData.business_id,
          responses: answers,
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

export const updateEmbeddingStatus = async (
  responseId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  embeddingId?: string
) => {
  if (!responseId) {
    throw new Error('Response ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const updateData: any = {
      embedding_status: status,
      embedding_processed_at: status === 'completed' ? new Date().toISOString() : null
    };
    
    const { data, error } = await supabase
      .from('survey_responses')
      .update(updateData)
      .eq('id', responseId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }, `Updating embedding status for response ${responseId}`);
};

export const createEmbedding = async (
  surveyId: string,
  responseId: string,
  embedding: number[],
  metadata?: Record<string, any>
) => {
  if (!surveyId || !responseId || !embedding) {
    throw new Error('Survey ID, response ID, and embedding are required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('survey_embeddings')
      .insert([{
        survey_id: surveyId,
        response_id: responseId,
        embedding: embedding,
        metadata: metadata || {}
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }, `Creating embedding for response ${responseId}`, 'Embedding created successfully!');
};

export const getEmbeddingsForSurvey = async (surveyId: string) => {
  if (!surveyId) {
    throw new Error('Survey ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('survey_embeddings')
      .select(`
        *,
        survey_responses (
          responses,
          created_at,
          user_id
        )
      `)
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }, `Fetching embeddings for survey ${surveyId}`);
};
