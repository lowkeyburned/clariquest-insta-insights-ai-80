
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, BarChart3, Database, MessageSquare } from "lucide-react";
import { BusinessWithSurveyCount } from "@/utils/types/database";
import { useChatMessages } from "./hooks/useChatMessages";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";

interface AIChatProps {
  type: "survey" | "chart" | "database";
  title: string;
  business: BusinessWithSurveyCount;
  onClose: () => void;
}

const AIChat = ({ type, title, business, onClose }: AIChatProps) => {
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
    mode: type === "survey" ? "survey" : type === "chart" ? "chart" : "chat-db"
  });

  const getIcon = () => {
    switch (type) {
      case "survey": return MessageSquare;
      case "chart": return BarChart3;
      case "database": return Database;
      default: return BrainCircuit;
    }
  };

  const Icon = getIcon();

  return (
    <Card className="h-[80vh] flex flex-col bg-clari-darkCard border-clari-darkAccent">
      <CardHeader className="border-b border-clari-darkAccent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="text-clari-gold" size={24} />
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <p className="text-sm text-clari-muted mt-1">
                AI assistance for {business.name}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          isFetchingHistory={isFetchingHistory}
          businessId={business.id || ''}
          createSurvey={createSurvey}
          onSelectPrompt={setQuickPrompt}
          mode={type === "survey" ? "survey" : type === "chart" ? "chart" : "chat-db"}
        />
        
        <div className="p-4 border-t border-clari-darkAccent">
          <ChatInput
            inputValue={inputValue}
            isLoading={isLoading}
            handleSubmit={sendMessage}
            setInputValue={setInputValue}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChat;
