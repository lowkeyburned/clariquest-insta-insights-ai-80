
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "../types/message";

interface MessageBubbleProps {
  message: Message;
  createSurvey: (content: string) => void;
  businessId: string; // We keep this prop but don't use it directly in the createSurvey call
}

const MessageBubble = ({ message, createSurvey, businessId }: MessageBubbleProps) => {
  return (
    <div 
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div 
        className={`max-w-[80%] rounded-lg p-4 ${
          message.role === "user" 
            ? "bg-clari-gold text-black" 
            : "bg-clari-darkBg border border-clari-darkAccent"
        }`}
      >
        {message.role === "assistant" && message.hasSurveyData && (
          <div className="mb-2">
            <span className="bg-clari-gold/20 text-clari-gold text-xs font-medium px-2 py-1 rounded">
              #Survey
            </span>
          </div>
        )}
        
        {message.role === "assistant" && !message.hasSurveyData && (
          <div className="mb-2">
            <span className="bg-blue-500/20 text-blue-400 text-xs font-medium px-2 py-1 rounded">
              #Insight
            </span>
          </div>
        )}
        
        <div className="whitespace-pre-wrap text-sm">
          {message.content}
        </div>
        
        {message.role === "assistant" && message.hasSurveyData && (
          <div className="mt-4 animate-fade-in">
            <Button 
              className="bg-clari-gold text-black hover:bg-clari-gold/90 gap-2"
              onClick={() => createSurvey(message.content)}
            >
              Create Survey
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
