
import { supabase } from '@/integrations/supabase/client';

export const debugAvailableSurveys = async () => {
  try {
    console.log('🔍 Checking available surveys in database...');
    
    const { data: surveys, error } = await supabase
      .from('surveys')
      .select('id, title, description, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching surveys:', error);
      return [];
    }

    if (!surveys || surveys.length === 0) {
      console.log('📭 No surveys found in database');
      return [];
    }

    console.log('📋 Available surveys:');
    surveys.forEach((survey, index) => {
      console.log(`${index + 1}. ${survey.title} (ID: ${survey.id})`);
      console.log(`   Created: ${new Date(survey.created_at).toLocaleDateString()}`);
      console.log(`   URL: /survey/${survey.id}`);
      console.log('');
    });

    return surveys;
  } catch (error) {
    console.error('💥 Failed to debug surveys:', error);
    return [];
  }
};

// Call this function in the browser console to see available surveys
if (typeof window !== 'undefined') {
  (window as any).debugSurveys = debugAvailableSurveys;
}
