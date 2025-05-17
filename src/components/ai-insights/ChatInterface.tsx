
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Send, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { BusinessWithSurveyCount } from "@/components/business/BusinessForm";
import RecentInsights from "./RecentInsights";

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

  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Simulate AI response (would be a real API call in production)
    setTimeout(() => {
      generateAIResponse(inputValue);
    }, 1000);
  };

  const generateAIResponse = (query: string) => {
    // Simulate generating AI response based on the query
    // In a real app, this would be an API call to an AI service
    
    // Check if the query might be related to surveys
    const isSurveyRelated = 
      query.toLowerCase().includes("survey") || 
      query.toLowerCase().includes("question") || 
      Math.random() > 0.5; // Randomly include survey data sometimes
    
    let responseText = "";
    
    if (isSurveyRelated) {
      responseText = `Based on your analysis of customer feedback for ${business.name}, I recommend creating a survey to gather more detailed insights.

Here are some suggested questions:
1. How satisfied are you with our recent product updates?
2. What features would you like to see improved?
3. How likely are you to recommend our services to others?

This survey will help you understand customer sentiment and identify areas for improvement.`;
    } else {
      responseText = `Analysis of social media engagement for ${business.name} shows a 23% increase in user interaction over the last month. Key trends include:

- Higher engagement on posts about sustainability
- Increased comments on product tutorials
- Growing interest from the 25-34 demographic

Recommendation: Focus content strategy on educational material and sustainability initiatives to capitalize on current audience interests.`;
    }
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: responseText,
      timestamp: new Date(),
      hasSurveyData: isSurveyRelated
    };
    
    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const createSurveyForBusiness = (content: string, businessId: string) => {
    toast.success(`Creating survey for business ID: ${businessId}`);
    // In a real app, this would navigate to the survey creation page
    // or call an API to create a survey
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
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
      </div>
      
      <div className="lg:col-span-1">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <CardTitle>Recent Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentInsights businessId={business.id || ''} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatInterface;
