
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

// Add the missing saveSurveyResponse function for backward compatibility
export const saveSurveyResponse = async (surveyId: string, responses: Record<string, string | string[]>) => {
  if (!surveyId) {
    throw new Error('Survey ID is required');
  }
  
  if (!responses || Object.keys(responses).length === 0) {
    throw new Error('Survey responses are required');
  }
  
  return wrapSupabaseOperation(async () => {
    console.log('Saving survey response:', { surveyId, responses });
    
    const { data, error } = await supabase
      .from('survey_responses')
      .insert([{
        survey_id: surveyId,
        responses: responses,
        user_id: null // Allow anonymous responses
      }])
      .select();
    
    if (error) {
      console.error('Error saving survey response:', error);
      throw error;
    }
    
    console.log('Survey response saved successfully:', data);
    return data;
  }, 'Saving survey response', 'Survey response saved successfully!');
};

// Re-export the survey functions from surveyHelpers
export { 
  fetchSurveyById, 
  fetchSurveyBySlug, 
  fetchSurveys,
  createSurvey,
  updateSurvey,
  deleteSurvey
} from './surveyHelpers';

// Re-export other functions for backward compatibility
export * from './businessHelpers';
export * from './campaignHelpers';
export * from './surveyResponseHelpers';
export * from './surveySubmissionHelpers';
export * from './settingsHelpers';
export * from './shareHelpers';

// Re-export Instagram data helpers
export * from './instagramDataHelpers';

// Re-export chat helpers
export * from './chatHelpers';
