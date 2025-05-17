
import { useRef, useEffect } from "react";
import { Message } from "../types/message";
import MessageBubble from "./MessageBubble";
import LoadingIndicator from "./LoadingIndicator";
import ChatWelcome from "./ChatWelcome";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  businessId: string;
  createSurvey: (content: string, businessId: string) => void;
  onSelectPrompt: (prompt: string) => void;
}

const ChatMessages = ({ 
  messages, 
  isLoading, 
  businessId, 
  createSurvey,
  onSelectPrompt
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
      {messages.length === 0 ? (
        <ChatWelcome onSelectPrompt={onSelectPrompt} />
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            createSurvey={createSurvey}
            businessId={businessId}
          />
        ))
      )}
      
      {isLoading && <LoadingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
