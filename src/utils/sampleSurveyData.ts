
export interface SurveyQuestion {
  id: string | number;
  question_text: string;
  question_type: "multiple_choice" | "open_ended" | "slider" | "likert" | "single_choice" | "yes_no" | "text";
  options?: string[] | null;
  min?: number;
  max?: number;
  required?: boolean;
  order_index?: number;
  // For backward compatibility
  text?: string;
  type?: string;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
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
        question_text: "How satisfied are you with our product?",
        question_type: "slider",
        min: 1,
        max: 5
      },
      {
        id: 2,
        question_text: "What features do you use most often?",
        question_type: "multiple_choice",
        options: ["Feature A", "Feature B", "Feature C", "Feature D"]
      },
      {
        id: 3,
        question_text: "Do you have any additional comments?",
        question_type: "open_ended"
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
        question_text: "How easy was it to navigate our application?",
        question_type: "slider",
        min: 1,
        max: 5
      },
      {
        id: 2,
        question_text: "Which of these features would you like to see improved?",
        question_type: "multiple_choice",
        options: ["UI Design", "Performance", "Features", "Documentation"]
      },
      {
        id: 3,
        question_text: "What was the primary reason for using our application?",
        question_type: "single_choice",
        options: ["Work", "Personal", "Education", "Other"]
      },
      {
        id: 4,
        question_text: "Please share any suggestions for improvement.",
        question_type: "open_ended"
      }
    ]
  }
];
