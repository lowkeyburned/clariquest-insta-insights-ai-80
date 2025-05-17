
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatWelcomeProps {
  onSelectPrompt: (prompt: string) => void;
}

const ChatWelcome = ({ onSelectPrompt }: ChatWelcomeProps) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <BrainCircuit className="mx-auto text-clari-gold" size={48} />
        <div>
          <h3 className="text-xl font-medium">AI Chat Assistant</h3>
          <p className="text-clari-muted mt-2">
            Ask questions about your business data or request insights
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto">
          <Button 
            variant="outline" 
            className="text-sm" 
            onClick={() => onSelectPrompt("Analyze customer feedback trends")}
          >
            Analyze customer feedback
          </Button>
          <Button 
            variant="outline" 
            className="text-sm" 
            onClick={() => onSelectPrompt("Create a survey about our product")}
          >
            Create a product survey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWelcome;
