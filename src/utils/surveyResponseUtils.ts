import { Survey } from "./sampleSurveyData";

export interface SurveyResponse {
  id: string;
  survey_id: string;
  answers: Record<string, any>;
  submittedAt?: string;
}

// Format a response for display
export const formatResponseForDisplay = (
  response: SurveyResponse, 
  survey: Survey
): Record<string, { question: string; answer: string | number }> => {
  const formatted: Record<string, { question: string; answer: string | number }> = {};
  
  survey.questions.forEach(question => {
    const answer = response.answers[question.id];
    
    if (answer) {
      formatted[question.id] = {
        question: question.text,
        answer: answer.value !== undefined ? answer.value : answer,
      };
    } else {
      formatted[question.id] = {
        question: question.text,
        answer: "No response",
      };
    }
  });
  
  return formatted;
};
