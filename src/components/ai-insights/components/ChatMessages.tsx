
import { useRef, useEffect } from "react";
import { Message } from "../types/message";
import MessageBubble from "./MessageBubble";
import LoadingIndicator from "./LoadingIndicator";
import ChatWelcome from "./ChatWelcome";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isFetchingHistory?: boolean;
  businessId: string;
  createSurvey: (content: string) => Promise<{ surveyId: string; shareableLink: string }>;
  onSelectPrompt: (prompt: string) => void;
  mode?: "survey" | "chart" | "chat-db";
}

const ChatMessages = ({ 
  messages, 
  isLoading, 
  isFetchingHistory = false,
  businessId, 
  createSurvey,
  onSelectPrompt,
  mode = "survey"
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (isFetchingHistory) {
    return (
      <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center">
        <LoadingIndicator message="Loading chat history..." />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
      {messages.length === 0 ? (
        <ChatWelcome onSelectPrompt={onSelectPrompt} mode={mode} />
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            createSurvey={createSurvey}
            businessId={businessId}
            mode={mode}
          />
        ))
      )}
      
      {isLoading && <LoadingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
