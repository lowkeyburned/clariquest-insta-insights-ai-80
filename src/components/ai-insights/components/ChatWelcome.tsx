
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatWelcomeProps {
  onSelectPrompt: (prompt: string) => void;
  mode?: "survey" | "chart" | "chat-db";
}

const ChatWelcome = ({ onSelectPrompt, mode = "survey" }: ChatWelcomeProps) => {
  const getModeSpecificContent = () => {
    switch (mode) {
      case "survey":
        return {
          title: "AI Survey Creator",
          description: "Create custom surveys for your business with AI assistance",
          prompts: [
            { text: "customer satisfaction", action: () => onSelectPrompt("customer satisfaction") },
            { text: "product feedback", action: () => onSelectPrompt("product feedback") }
          ]
        };
      case "chart":
        return {
          title: "AI Chart Generator",
          description: "Generate insightful charts based on your business data",
          prompts: [
            { text: "sales trends", action: () => onSelectPrompt("sales trends") },
            { text: "customer growth", action: () => onSelectPrompt("customer growth") }
          ]
        };
      case "chat-db":
        return {
          title: "AI Database Assistant",
          description: "Query your business database using natural language",
          prompts: [
            { text: "recent transactions", action: () => onSelectPrompt("recent transactions") },
            { text: "customer demographics", action: () => onSelectPrompt("customer demographics") }
          ]
        };
      default:
        return {
          title: "AI Chat Assistant",
          description: "Ask questions about your business data or request insights",
          prompts: [
            { text: "Analyze customer feedback", action: () => onSelectPrompt("Analyze customer feedback trends") },
            { text: "Create a product survey", action: () => onSelectPrompt("Create a survey about our product") }
          ]
        };
    }
  };

  const content = getModeSpecificContent();

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <BrainCircuit className="mx-auto text-clari-gold" size={48} />
        <div>
          <h3 className="text-xl font-medium">{content.title}</h3>
          <p className="text-clari-muted mt-2">
            {content.description}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto">
          {content.prompts.map((prompt, index) => (
            <Button 
              key={index}
              variant="outline" 
              className="text-sm" 
              onClick={prompt.action}
            >
              {prompt.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatWelcome;
