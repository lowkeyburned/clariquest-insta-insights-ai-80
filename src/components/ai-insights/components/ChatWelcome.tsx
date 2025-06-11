
import { MessageSquare, BarChart3, Database, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatWelcomeProps {
  onSelectPrompt: (prompt: string) => void;
  mode?: "survey" | "chart" | "chat-db";
}

const ChatWelcome = ({ onSelectPrompt, mode = "survey" }: ChatWelcomeProps) => {
  const getSuggestions = () => {
    switch (mode) {
      case "survey":
        return [
          "Create a customer satisfaction survey for my coffee shop",
          "Generate feedback questions about product quality",
          "Design a survey to understand customer preferences",
          "Create questions for employee satisfaction assessment"
        ];
      case "chart":
        return [
          "Show me a bar chart of monthly sales data with sample data",
          "Create a line chart showing revenue trends over 6 months",
          "Generate a pie chart of device usage distribution",
          "Display a comparison chart of sales vs expenses"
        ];
      case "chat-db":
        return [
          "Show me the total number of survey responses",
          "Which surveys have the highest response rates?",
          "What are the most common feedback themes?",
          "Display recent business analytics"
        ];
      default:
        return [];
    }
  };

  const getIcon = () => {
    switch (mode) {
      case "survey": return MessageSquare;
      case "chart": return BarChart3;
      case "chat-db": return Database;
      default: return Sparkles;
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "survey": return "Survey AI Assistant";
      case "chart": return "Chart AI Assistant";
      case "chat-db": return "Database AI Assistant";
      default: return "AI Assistant";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "survey": return "I can help you create intelligent surveys and questionnaires for customer feedback.";
      case "chart": return "I can help you create various types of charts and data visualizations.";
      case "chat-db": return "I can help you query and analyze your business data using natural language.";
      default: return "How can I assist you today?";
    }
  };

  const Icon = getIcon();
  const suggestions = getSuggestions();

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-8 text-center">
      <div className="p-4 rounded-full bg-clari-gold/10 mb-6">
        <Icon className="text-clari-gold" size={48} />
      </div>
      
      <h2 className="text-2xl font-bold text-clari-text mb-4">
        {getTitle()}
      </h2>
      
      <p className="text-clari-muted text-lg mb-8 leading-relaxed">
        {getDescription()}
      </p>
      
      <div className="w-full space-y-3">
        <p className="text-sm font-medium text-clari-muted mb-4">Try asking:</p>
        
        <div className="grid gap-3">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full text-left justify-start h-auto p-4 border-clari-darkAccent hover:border-clari-gold hover:bg-clari-gold/5 transition-colors"
              onClick={() => onSelectPrompt(suggestion)}
            >
              <div className="flex items-start gap-3">
                <Sparkles className="text-clari-gold mt-0.5 flex-shrink-0" size={16} />
                <span className="text-sm text-clari-text">{suggestion}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
      
      <div className="mt-8 text-xs text-clari-muted">
        Type your message below to get started
      </div>
    </div>
  );
};

export default ChatWelcome;
