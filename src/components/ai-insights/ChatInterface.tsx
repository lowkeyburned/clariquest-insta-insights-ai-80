
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ChatProps } from "./types/message";
import { useChatMessages } from "./hooks/useChatMessages";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";

const ChatInterface = ({ business }: ChatProps) => {
  if (!business?.id) {
    return (
      <Card className="bg-clari-darkCard border-clari-darkAccent h-[600px] flex flex-col items-center justify-center">
        <p className="text-clari-muted">Please select a valid business to start chatting.</p>
      </Card>
    );
  }

  console.log(`ChatInterface initialized for business ID: ${business.id}`);

  const { 
    messages, 
    inputValue, 
    isLoading, 
    isFetchingHistory,
    sendMessage, 
    setInputValue,
    setQuickPrompt
  } = useChatMessages(business);

  const createSurveyForBusiness = (content: string, businessId: string) => {
    if (!businessId) {
      toast.error("No business ID available to create survey");
      return;
    }
    
    toast.success(`Creating survey for business ID: ${businessId}`);
    // In a real app, this would navigate to the survey creation page
    // or call an API to create a survey
  };

  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent h-[600px] flex flex-col">
      <ChatMessages 
        messages={messages}
        isLoading={isLoading}
        isFetchingHistory={isFetchingHistory}
        businessId={business.id}
        createSurvey={createSurveyForBusiness}
        onSelectPrompt={setQuickPrompt}
      />
      
      <ChatInput 
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={sendMessage}
        isLoading={isLoading}
      />
    </Card>
  );
};

export default ChatInterface;
