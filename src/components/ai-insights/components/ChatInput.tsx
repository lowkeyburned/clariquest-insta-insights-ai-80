
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

const ChatInput = ({ inputValue, setInputValue, handleSubmit, isLoading }: ChatInputProps) => {
  return (
    <div className="p-4 border-t border-clari-darkAccent">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about your business data..."
          className="flex-1 border-clari-darkAccent bg-clari-darkBg"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="bg-clari-gold text-black hover:bg-clari-gold/90 px-4"
          disabled={isLoading}
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
