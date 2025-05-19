
export interface SurveyQuestion {
  id: number | string;
  text: string;
  type: "multiple_choice" | "open_ended" | "slider" | "likert" | "single_choice";
  options?: string[];
  min?: number;
  max?: number;
  required?: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  createdAt?: string;
  businessId?: string;
  isActive?: boolean;
  slug?: string;
}

// Sample survey data for testing and development
export const sampleSurveys: Survey[] = [
  {
    id: "1",
    title: "Customer Satisfaction Survey",
    description: "Help us improve our product with your feedback",
    questions: [
      {
        id: 1,
        text: "How satisfied are you with our product?",
        type: "slider",
        min: 1,
        max: 5
      },
      {
        id: 2,
        text: "What features do you use most often?",
        type: "multiple_choice",
        options: ["Feature A", "Feature B", "Feature C", "Feature D"]
      },
      {
        id: 3,
        text: "Do you have any additional comments?",
        type: "open_ended"
      }
    ]
  },
  {
    id: "2",
    title: "User Experience Survey",
    description: "Tell us about your experience using our application",
    questions: [
      {
        id: 1,
        text: "How easy was it to navigate our application?",
        type: "slider",
        min: 1,
        max: 5
      },
      {
        id: 2,
        text: "Which of these features would you like to see improved?",
        type: "multiple_choice",
        options: ["UI Design", "Performance", "Features", "Documentation"]
      },
      {
        id: 3,
        text: "What was the primary reason for using our application?",
        type: "single_choice",
        options: ["Work", "Personal", "Education", "Other"]
      },
      {
        id: 4,
        text: "Please share any suggestions for improvement.",
        type: "open_ended"
      }
    ]
  }
];
