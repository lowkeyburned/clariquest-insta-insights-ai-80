
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
    <Card className="h-[85vh] flex flex-col bg-clari-darkCard border-clari-darkAccent shadow-2xl">
      <CardHeader className="border-b border-clari-darkAccent bg-clari-darkBg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-clari-gold/10">
              <Icon className="text-clari-gold" size={28} />
            </div>
            <div>
              <CardTitle className="text-2xl text-clari-gold">{title}</CardTitle>
              <p className="text-sm text-clari-muted mt-1">
                AI assistance for <span className="text-clari-text font-medium">{business.name}</span>
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="gap-2 hover:bg-clari-darkAccent border-clari-darkAccent"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          isFetchingHistory={isFetchingHistory}
          businessId={business.id || ''}
          createSurvey={createSurvey}
          onSelectPrompt={setQuickPrompt}
          mode={type === "survey" ? "survey" : type === "chart" ? "chart" : "chat-db"}
        />
        
        <div className="border-t border-clari-darkAccent bg-clari-darkBg">
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
