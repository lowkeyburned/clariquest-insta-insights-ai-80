
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "../types/message";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface MessageBubbleProps {
  message: Message;
  createSurvey: (content: string) => void;
  businessId: string;
}

const MessageBubble = ({ message, createSurvey, businessId }: MessageBubbleProps) => {
  const [isCreatingSurvey, setIsCreatingSurvey] = useState(false);
  const navigate = useNavigate();

  const handleCreateSurvey = async () => {
    setIsCreatingSurvey(true);
    try {
      // Show a loading toast
      toast.loading("Creating your survey...");
      
      // Call the createSurvey function and pass the content
      const surveyId = await createSurvey(message.content);
      
      // Clear the loading toast and show success
      toast.dismiss();
      toast.success("Survey created successfully!");
      
      // Navigate to the survey detail page after a brief delay
      setTimeout(() => {
        navigate(`/survey/${surveyId}`);
      }, 500);
    } catch (error) {
      // Clear the loading toast and show error
      toast.dismiss();
      console.error("Error creating survey:", error);
      toast.error(`${(error as Error).message}`);
    } finally {
      setIsCreatingSurvey(false);
    }
  };

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
              onClick={handleCreateSurvey}
              disabled={isCreatingSurvey}
            >
              {isCreatingSurvey ? "Creating Survey..." : "Create Survey"}
              {!isCreatingSurvey && <ArrowRight size={16} />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
