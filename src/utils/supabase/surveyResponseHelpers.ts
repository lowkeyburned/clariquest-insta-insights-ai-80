
import { supabase } from '@/integrations/supabase/client';

/**
 * Survey response management functions
 */

export const saveSurveyResponse = async (surveyId: string, answers: Record<number | string, string | number>) => {
  // Create survey response record
  const { data: responseData, error: responseError } = await supabase
    .from('survey_responses')
    .insert([{
      survey_id: surveyId,
      completed: true
    }])
    .select();
  
  if (responseError || !responseData) throw responseError;
  
  const responseId = responseData[0].id;
  
  // Convert answers to array of answer records
  const answerRecords = Object.entries(answers).map(([questionId, answer]) => ({
    survey_response_id: responseId,
    question_id: questionId,
    answer_value: typeof answer === 'string' ? { value: answer } : { value: answer.toString() }
  }));
  
  // Insert all answers
  const { error: answersError } = await supabase
    .from('response_answers')
    .insert(answerRecords);
  
  if (answersError) throw answersError;
  
  return responseData[0];
};

export const fetchSurveyResponses = async (surveyId: string) => {
  // Fetch all responses for a survey
  const { data: responses, error: responsesError } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('survey_id', surveyId);
  
  if (responsesError) throw responsesError;
  
  if (responses.length === 0) {
    return [];
  }
  
  // Fetch all answers for these responses
  const responseIds = responses.map(r => r.id);
  
  const { data: answers, error: answersError } = await supabase
    .from('response_answers')
    .select('*, survey_response_id, question_id')
    .in('survey_response_id', responseIds);
  
  if (answersError) throw answersError;
  
  // Group answers by response
  const responseAnswers = responses.map(response => {
    const responseAnswers = answers.filter(answer => answer.survey_response_id === response.id);
    
    const answersMap: Record<string, any> = {};
    responseAnswers.forEach(answer => {
      answersMap[answer.question_id] = answer.answer_value;
    });
    
    return {
      ...response,
      answers: answersMap,
      submittedAt: response.created_at
    };
  });
  
  return responseAnswers;
};
