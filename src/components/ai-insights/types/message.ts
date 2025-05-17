
import { BusinessWithSurveyCount } from "@/components/business/BusinessForm";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasSurveyData?: boolean;
}

export interface ChatProps {
  business: BusinessWithSurveyCount;
}
