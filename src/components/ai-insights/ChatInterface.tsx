
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Send, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { BusinessWithSurveyCount } from "@/components/business/BusinessForm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasSurveyData?: boolean;
}

interface ChatInterfaceProps {
  business: BusinessWithSurveyCount;
}

const ChatInterface = ({ business }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      await fetchChatResponse(inputValue);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      toast.error("Failed to get AI response. Please try again.");
      setIsLoading(false);
    }
  };

  const fetchChatResponse = async (query: string) => {
    try {
      const response = await fetch("http://localhost:5678/webhook/fa910689-c7eb-420d-861b-890cec67ba97/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: query,
          businessName: business.name,
          businessId: business.id || "",
          businessDescription: business.description || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if the response has survey-related content
      const isSurveyRelated = 
        data.message.toLowerCase().includes("survey") || 
        data.message.toLowerCase().includes("question");
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        hasSurveyData: isSurveyRelated
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const createSurveyForBusiness = (content: string, businessId: string) => {
    toast.success(`Creating survey for business ID: ${businessId}`);
    // In a real app, this would navigate to the survey creation page
    // or call an API to create a survey
  };

  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent h-[600px] flex flex-col">
      <div className="flex-1 overflow-auto p-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
        {messages.length === 0 && (
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
                <Button variant="outline" className="text-sm" onClick={() => setInputValue("Analyze customer feedback trends")}>
                  Analyze customer feedback
                </Button>
                <Button variant="outline" className="text-sm" onClick={() => setInputValue("Create a survey about our product")}>
                  Create a product survey
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div 
            key={message.id} 
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
                    onClick={() => createSurveyForBusiness(message.content, business.id || '')}
                  >
                    Create Survey
                    <ArrowRight size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-4 bg-clari-darkBg border border-clari-darkAccent">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-clari-gold/60 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-clari-gold/60 animate-pulse delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-clari-gold/60 animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
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
    </Card>
  );
};

export default ChatInterface;
