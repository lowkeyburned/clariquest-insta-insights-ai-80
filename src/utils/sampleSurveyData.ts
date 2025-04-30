
export interface SurveyQuestion {
  id: number;
  type: "multiple_choice" | "open_ended" | "slider";
  text: string;
  options?: string[];
  min?: number;
  max?: number;
}

export interface SurveyData {
  id: string;
  businessName: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  createdAt: string;
}

export const initializeSampleSurvey = () => {
  const surveys = JSON.parse(localStorage.getItem('surveys') || '[]');
  if (!surveys.some((s: SurveyData) => s.id === "1")) {
    const sampleSurvey: SurveyData = {
      id: "1",
      businessName: "Sample Business",
      title: "Customer Satisfaction Survey",
      description: "Please help us improve our services by answering a few questions.",
      questions: [
        {
          id: 1,
          type: "multiple_choice",
          text: "How satisfied are you with our service?",
          options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
        },
        {
          id: 2,
          type: "open_ended",
          text: "What suggestions do you have for improving our service?",
        },
        {
          id: 3,
          type: "slider",
          text: "On a scale of 0-10, how likely are you to recommend us to a friend?",
          min: 0,
          max: 10
        }
      ],
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('surveys', JSON.stringify([...surveys, sampleSurvey]));
  }
};

export const getSurveyById = (surveyId: string): SurveyData | undefined => {
  const surveys = JSON.parse(localStorage.getItem('surveys') || '[]');
  return surveys.find((s: SurveyData) => s.id === surveyId);
};
