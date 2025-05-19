
import { Survey } from "./sampleSurveyData";

export interface SurveyResponse {
  id: string;
  survey_id?: string;
  surveyId?: string;
  answers: Record<string | number, any>;
  submittedAt?: string;
  created_at?: string;
}

// Format a response for display
export const formatResponseForDisplay = (
  response: SurveyResponse, 
  survey: Survey
): Record<string, { question: string; answer: string | number }> => {
  const formatted: Record<string, { question: string; answer: string | number }> = {};
  
  Object.entries(response.answers || {}).forEach(([questionId, answer]) => {
    // Find the question by ID
    const question = survey.questions.find(q => q.id.toString() === questionId.toString());
    
    if (question) {
      // Extract the answer value
      const answerValue = typeof answer === 'object' && answer !== null 
        ? answer.value || answer.toString()
        : answer.toString();
      
      formatted[questionId] = {
        question: question.text,
        answer: answerValue
      };
    }
  });
  
  return formatted;
};
