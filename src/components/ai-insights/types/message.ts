
import { BusinessWithSurveyCount } from "@/utils/types/database";

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
