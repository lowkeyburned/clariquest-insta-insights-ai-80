
import { supabase } from '@/integrations/supabase/client';
import { wrapSupabaseOperation } from './errorHandler';

export const updateSurveyWebhook = async (surveyId: string, webhookUrl: string) => {
  if (!surveyId) {
    throw new Error('Survey ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    console.log('Updating survey webhook:', { surveyId, webhookUrl });
    
    const { data, error } = await supabase
      .from('surveys')
      .update({ webhook_url: webhookUrl })
      .eq('id', surveyId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating survey webhook:', error);
      throw error;
    }
    
    console.log('Survey webhook updated successfully:', data);
    return data;
  }, `Updating webhook for survey ${surveyId}`, 'Survey webhook updated successfully!');
};

export const setSurveyWebhookForCurrentSurvey = async () => {
  const webhookUrl = 'https://clariquest.app.n8n.cloud/webhook-test/e14fdeac-f48b-44e6-96cd-2d946bb6d47d';
  const surveyId = 'ad2aa0e1-2e6f-4f67-bcdb-6f034581bb3d'; // Current survey ID from the route
  
  try {
    const result = await updateSurveyWebhook(surveyId, webhookUrl);
    console.log('Webhook configured successfully for current survey');
    return result;
  } catch (error) {
    console.error('Failed to configure webhook:', error);
    throw error;
  }
};
