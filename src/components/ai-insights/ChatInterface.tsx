
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ChatProps } from "./types/message";
import { useChatMessages } from "./hooks/useChatMessages";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import { Button } from "@/components/ui/button";
import { FileText, BarChart, Database } from "lucide-react";

// Define chat modes
type ChatMode = "survey" | "chart" | "chat-db";

const ChatInterface = ({ business }: ChatProps) => {
  const [chatMode, setChatMode] = useState<ChatMode>("survey");

  if (!business?.id) {
    return (
      <Card className="bg-clari-darkCard border-clari-darkAccent h-[600px] flex flex-col items-center justify-center">
        <p className="text-clari-muted">Please select a valid business to start chatting.</p>
      </Card>
    );
  }

  console.log(`ChatInterface initialized for business ID: ${business.id}`);
  
  // Log specifically for the business ID from the screenshot
  if (business.id === "429ba186-2307-41e6-8340-66b1cfe5d576") {
    console.log("Detected Listmybusiness with ID 429ba186-2307-41e6-8340-66b1cfe5d576");
  }

  // Get the appropriate webhook URL based on the chat mode
  const getWebhookInfo = () => {
    switch (chatMode) {
      case "survey":
        return {
          name: "Survey",
          prompt: "Create a survey about",
          url: "http://localhost:5678/webhook-test/ab4a8a3c-0b5a-4728-9983-25caff5d1b9c"
        };
      case "chart":
        return {
          name: "Chart",
          prompt: "Generate a chart for",
          url: null // Chart doesn't use webhook
        };
      case "chat-db":
        return {
          name: "Chat with DB",
          prompt: "Query the database for",
          url: "http://localhost:5678/webhook-test/eea3111a-3285-40c1-a0d9-d28a9d691707"
        };
    }
  };

  const webhookInfo = getWebhookInfo();

  const { 
    messages, 
    inputValue, 
    isLoading, 
    isFetchingHistory,
    sendMessage, 
    setInputValue,
    setQuickPrompt,
    createSurvey
  } = useChatMessages({
    business,
    webhookUrl: webhookInfo.url || undefined,
    mode: chatMode
  });

  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent h-[600px] flex flex-col">
      <div className="flex justify-center p-2 gap-2 border-b border-clari-darkAccent">
        <Button 
          variant={chatMode === "survey" ? "default" : "outline"}
          onClick={() => setChatMode("survey")}
          className="flex items-center gap-2"
        >
          <FileText size={16} />
          <span>Survey</span>
        </Button>
        <Button 
          variant={chatMode === "chart" ? "default" : "outline"}
          onClick={() => setChatMode("chart")}
          className="flex items-center gap-2"
        >
          <BarChart size={16} />
          <span>Chart</span>
        </Button>
        <Button 
          variant={chatMode === "chat-db" ? "default" : "outline"}
          onClick={() => setChatMode("chat-db")}
          className="flex items-center gap-2"
        >
          <Database size={16} />
          <span>Chat with DB</span>
        </Button>
      </div>
      
      <ChatMessages 
        messages={messages}
        isLoading={isLoading}
        isFetchingHistory={isFetchingHistory}
        businessId={business.id}
        createSurvey={createSurvey}
        onSelectPrompt={(prompt) => setQuickPrompt(`${webhookInfo.prompt} ${prompt}`)}
        mode={chatMode}
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
