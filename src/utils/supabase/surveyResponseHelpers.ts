
import { supabase } from '@/integrations/supabase/client';

/**
 * Survey response management functions
 */

export const saveSurveyResponse = async (surveyId: string, answers: Record<number | string, string | number | string[]>) => {
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
  const answerRecords = Object.entries(answers).map(([questionId, answer]) => {
    // Handle different answer types properly
    let answerValue;
    
    if (Array.isArray(answer)) {
      // For multiple choice questions
      answerValue = { values: answer };
    } else if (typeof answer === 'number') {
      // For numeric values like sliders or Likert scale
      answerValue = { value: answer.toString() };
    } else {
      // For string values (open-ended or single choice)
      answerValue = { value: answer };
    }
    
    return {
      survey_response_id: responseId,
      question_id: questionId,
      answer_value: answerValue
    };
  });
  
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

export const fetchSurveyResponsesByQuestionId = async (questionId: string | number) => {
  // Fetch all answers for a specific question
  const { data, error } = await supabase
    .from('response_answers')
    .select('*')
    .eq('question_id', questionId.toString()); // Convert to string to ensure compatibility
  
  if (error) {
    console.error("Error fetching survey responses:", error);
    return { data: [], error };
  }
  
  return { data, error };
};

// Helper function to parse survey data from chat text
export const parseQuestionTypeFromText = (question: string): {
  type: "multiple_choice" | "open_ended" | "slider" | "likert" | "single_choice";
  extractedOptions?: string[];
} => {
  // Default to open_ended
  let type: "multiple_choice" | "open_ended" | "slider" | "likert" | "single_choice" = "open_ended";
  let extractedOptions: string[] = [];
  
  // Check if the question specifies its type
  if (question.toLowerCase().includes("multiple choice")) {
    type = "multiple_choice";
  } else if (question.toLowerCase().includes("single choice")) {
    type = "single_choice";
  } else if (question.toLowerCase().includes("likert")) {
    type = "likert";
  } 
  
  // Extract options if they exist
  const optionPattern = /(?:^|\s*[-–]?\s*)([a-f]\))\s*([^a-f\)]+?)(?=\s+[a-f]\)|$)/gi;
  const matches = [...question.matchAll(optionPattern)];
  
  if (matches && matches.length > 0) {
    extractedOptions = matches.map(match => match[2].trim());
    
    // If we found options but didn't detect a type, default to single choice
    if (type === "open_ended" && extractedOptions.length > 0) {
      type = "single_choice";
    }
  }
  
  return { type, extractedOptions };
};
