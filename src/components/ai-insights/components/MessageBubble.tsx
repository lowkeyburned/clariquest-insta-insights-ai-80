import { ArrowRight, ExternalLink, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "../types/message";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ChartRenderer from "./ChartRenderer";
import { detectChartData } from "../utils/chartUtils";

interface MessageBubbleProps {
  message: Message;
  createSurvey: (content: string) => Promise<{ surveyId: string; shareableLink: string }>;
  businessId: string;
  mode?: "survey" | "chart" | "chat-db";
}

const MessageBubble = ({ message, createSurvey, businessId, mode = "survey" }: MessageBubbleProps) => {
  const [isCreatingSurvey, setIsCreatingSurvey] = useState(false);
  const [surveyCreated, setSurveyCreated] = useState<{ surveyId: string; shareableLink: string } | null>(null);
  const navigate = useNavigate();

  // Detect chart data in the message content
  const chartData = mode === "chart" && message.role === "assistant" ? detectChartData(message.content) : null;

  const handleCreateSurvey = async () => {
    setIsCreatingSurvey(true);
    try {
      // Show a loading toast
      toast.loading("Creating your survey...");
      
      // Call the createSurvey function and pass the content
      const result = await createSurvey(message.content);
      
      // Clear the loading toast and show success
      toast.dismiss();
      toast.success("Survey created successfully!");
      
      // Store the survey creation result
      setSurveyCreated(result);
    } catch (error) {
      // Clear the loading toast and show error
      toast.dismiss();
      console.error("Error creating survey:", error);
      toast.error(`${(error as Error).message}`);
    } finally {
      setIsCreatingSurvey(false);
    }
  };

  const handleNavigateToSurvey = () => {
    if (surveyCreated) {
      navigate(`/survey/${surveyCreated.surveyId}`);
    }
  };

  const handleViewResults = () => {
    if (surveyCreated) {
      navigate(`/survey/results/${surveyCreated.surveyId}`);
    }
  };

  const handleCopyLink = () => {
    if (surveyCreated) {
      navigator.clipboard.writeText(surveyCreated.shareableLink);
      toast.success("Shareable link copied to clipboard!");
    }
  };

  // Only show survey-related features in survey mode
  const isSurveyMode = mode === "survey";
  const showSurveyFeatures = isSurveyMode && message.role === "assistant" && message.hasSurveyData;

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
        {message.role === "assistant" && showSurveyFeatures && (
          <div className="mb-2">
            <span className="bg-clari-gold/20 text-clari-gold text-xs font-medium px-2 py-1 rounded">
              #Survey
            </span>
          </div>
        )}
        
        {message.role === "assistant" && !showSurveyFeatures && (
          <div className="mb-2">
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              mode === "chart" 
                ? "bg-blue-500/20 text-blue-400" 
                : mode === "chat-db"
                ? "bg-green-500/20 text-green-400"
                : "bg-blue-500/20 text-blue-400"
            }`}>
              #{mode === "chart" ? "Chart" : mode === "chat-db" ? "Database" : "Insight"}
            </span>
          </div>
        )}
        
        <div className="whitespace-pre-wrap text-sm">
          {message.content}
        </div>

        {/* Render chart if chart data is detected */}
        {chartData && (
          <div className="mt-4">
            <ChartRenderer chartData={chartData} />
          </div>
        )}
        
        {showSurveyFeatures && !surveyCreated && (
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

        {surveyCreated && isSurveyMode && (
          <div className="mt-4 p-3 bg-clari-gold/10 border border-clari-gold/30 rounded-lg">
            <p className="text-sm text-clari-gold mb-3 font-medium">Survey Created Successfully!</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm"
                className="bg-clari-gold text-black hover:bg-clari-gold/90 gap-2"
                onClick={handleNavigateToSurvey}
              >
                <ExternalLink size={14} />
                Open Survey
              </Button>
              <Button 
                size="sm"
                variant="outline"
                className="border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black gap-2"
                onClick={handleViewResults}
              >
                <BarChart3 size={14} />
                View Results
              </Button>
              <Button 
                size="sm"
                variant="outline"
                className="border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black"
                onClick={handleCopyLink}
              >
                Copy Link
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
