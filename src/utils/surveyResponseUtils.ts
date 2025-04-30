
import { SurveyData } from "./sampleSurveyData";

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Record<number, string | number>;
  submittedAt: string;
}

// Save a new survey response
export const saveSurveyResponse = (surveyId: string, answers: Record<number, string | number>): string => {
  const responseId = `response-${Date.now()}`;
  const response: SurveyResponse = {
    id: responseId,
    surveyId,
    answers,
    submittedAt: new Date().toISOString(),
  };

  // Get existing responses
  const responses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
  
  // Add new response
  localStorage.setItem('surveyResponses', JSON.stringify([...responses, response]));
  
  return responseId;
};

// Get all responses for a specific survey
export const getSurveyResponses = (surveyId: string): SurveyResponse[] => {
  const responses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
  return responses.filter((response: SurveyResponse) => response.surveyId === surveyId);
};

// Format a response for display
export const formatResponseForDisplay = (
  response: SurveyResponse, 
  survey: SurveyData
): Record<string, { question: string; answer: string | number }> => {
  const formatted: Record<string, { question: string; answer: string | number }> = {};
  
  Object.entries(response.answers).forEach(([questionIndex, answer]) => {
    const index = parseInt(questionIndex);
    const question = survey.questions[index];
    
    if (question) {
      formatted[questionIndex] = {
        question: question.text,
        answer
      };
    }
  });
  
  return formatted;
};
