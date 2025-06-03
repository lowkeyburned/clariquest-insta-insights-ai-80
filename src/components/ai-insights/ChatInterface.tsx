
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessWithSurveyCount } from "@/utils/types/database";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import { useChatMessages } from "./hooks/useChatMessages";
import { BrainCircuit, MessageSquare, BarChart3, Database } from "lucide-react";

interface ChatInterfaceProps {
  business: BusinessWithSurveyCount;
}

const ChatInterface = ({ business }: ChatInterfaceProps) => {
  const [activeMode, setActiveMode] = useState<"survey" | "chart" | "chat-db">("survey");
  
  // Define webhook URLs for different modes
  const webhookUrls = {
    survey: "https://n8n-loc-app.onrender.com/webhook-test/ab4a8a3c-0b5a-4728-9983-25caff5d1b9c",
    chart: undefined, // Will use default webhook
    "chat-db": undefined // Will use default webhook
  };

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
    webhookUrl: webhookUrls[activeMode],
    mode: activeMode 
  });

  const handleTabChange = (value: string) => {
    setActiveMode(value as "survey" | "chart" | "chat-db");
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <Tabs value={activeMode} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="survey" className="flex items-center gap-2">
            <BrainCircuit size={16} />
            Survey AI
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Chart AI
          </TabsTrigger>
          <TabsTrigger value="chat-db" className="flex items-center gap-2">
            <Database size={16} />
            Database AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="survey" className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="text-clari-gold" size={20} />
                Survey AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ChatMessages
                messages={messages}
                isLoading={isLoading}
                isFetchingHistory={isFetchingHistory}
                businessId={business.id || ''}
                createSurvey={createSurvey}
                onSelectPrompt={setQuickPrompt}
                mode="survey"
              />
              <div className="p-4 border-t border-clari-darkAccent">
                <ChatInput
                  inputValue={inputValue}
                  isLoading={isLoading}
                  onSubmit={sendMessage}
                  onChange={setInputValue}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="text-clari-gold" size={20} />
                Chart AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ChatMessages
                messages={messages}
                isLoading={isLoading}
                isFetchingHistory={isFetchingHistory}
                businessId={business.id || ''}
                createSurvey={createSurvey}
                onSelectPrompt={setQuickPrompt}
                mode="chart"
              />
              <div className="p-4 border-t border-clari-darkAccent">
                <ChatInput
                  inputValue={inputValue}
                  isLoading={isLoading}
                  onSubmit={sendMessage}
                  onChange={setInputValue}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat-db" className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="text-clari-gold" size={20} />
                Database AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ChatMessages
                messages={messages}
                isLoading={isLoading}
                isFetchingHistory={isFetchingHistory}
                businessId={business.id || ''}
                createSurvey={createSurvey}
                onSelectPrompt={setQuickPrompt}
                mode="chat-db"
              />
              <div className="p-4 border-t border-clari-darkAccent">
                <ChatInput
                  inputValue={inputValue}
                  isLoading={isLoading}
                  onSubmit={sendMessage}
                  onChange={setInputValue}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatInterface;
