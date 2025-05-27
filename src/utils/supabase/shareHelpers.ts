
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * Survey sharing functions with comprehensive error handling
 */

export const getSurveyShareURL = async (surveyId: string) => {
  if (!surveyId) {
    throw new Error('Survey ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('surveys')
      .select('slug')
      .eq('id', surveyId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Survey not found');
      }
      throw error;
    }
    
    if (!data?.slug) {
      throw new Error('Survey does not have a valid sharing slug');
    }
    
    return `${window.location.origin}/survey/${data.slug}`;
  }, `Getting share URL for survey ${surveyId}`);
};
