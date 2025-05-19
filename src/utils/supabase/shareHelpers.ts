
import { supabase } from '@/integrations/supabase/client';

/**
 * Survey sharing functions
 */

export const getSurveyShareURL = async (surveyId: string) => {
  const { data, error } = await supabase
    .from('surveys')
    .select('slug')
    .eq('id', surveyId)
    .single();
  
  if (error) throw error;
  return `${window.location.origin}/survey/${data.slug}`;
};
