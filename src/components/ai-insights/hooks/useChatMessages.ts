
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Message } from "../types/message";
import { BusinessWithSurveyCount } from "@/utils/types/database";
import { fetchAIResponse, createSurveyFromChat } from "../api/chatService";
import { createUserMessage, createAssistantMessage, createFallbackMessage } from "../utils/messageUtils";
import { 
  createChatConversation, 
  fetchChatConversations, 
  fetchChatMessages, 
  saveChatMessage,
  ChatConversation 
} from "@/utils/supabase/chatHelpers";

interface UseChatMessagesProps {
  business: BusinessWithSurveyCount | null | undefined;
  webhookUrl?: string;
  mode: "survey" | "chart" | "chat-db";
}

export const useChatMessages = ({ business, webhookUrl, mode }: UseChatMessagesProps) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);

  // Fetch conversations when business or mode changes
  useEffect(() => {
    if (!business?.id) {
      setIsFetchingHistory(false);
      return;
    }
    
    const loadConversations = async () => {
      setIsFetchingHistory(true);
      try {
        console.log(`Loading conversations for business ID: ${business.id} in mode: ${mode}`);
        
        const convos = await fetchChatConversations(business.id, mode);
        setConversations(convos);
        
        // If there are conversations, load the most recent one
        if (convos.length > 0 && !currentConversationId) {
          setCurrentConversationId(convos[0].id);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Failed to load conversations.");
      } finally {
        setIsFetchingHistory(false);
      }
    };
    
    loadConversations();
  }, [business?.id, mode]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!currentConversationId) {
      setMessages([]);
      return;
    }
    
    const loadMessages = async () => {
      try {
        console.log(`Loading messages for conversation: ${currentConversationId}`);
        const msgs = await fetchChatMessages(currentConversationId);
        setMessages(msgs);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages.");
      }
    };
    
    loadMessages();
  }, [currentConversationId]);

  const createNewConversation = async () => {
    if (!business?.id) {
      toast.error("Please select a valid business before creating a conversation.");
      return;
    }

    try {
      const newConvo = await createChatConversation(business.id, mode);
      setConversations(prev => [newConvo, ...prev]);
      setCurrentConversationId(newConvo.id);
      setMessages([]);
      toast.success("New conversation created!");
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create new conversation.");
    }
  };

  const selectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    if (!business?.id) {
      console.error("No business ID available for sending message");
      toast.error("Please select a valid business before sending messages.");
      return;
    }

    // Create new conversation if none exists
    let conversationId = currentConversationId;
    if (!conversationId) {
      try {
        const newConvo = await createChatConversation(business.id, mode);
        setConversations(prev => [newConvo, ...prev]);
        conversationId = newConvo.id;
        setCurrentConversationId(conversationId);
      } catch (error) {
        console.error("Error creating conversation:", error);
        toast.error("Failed to create conversation.");
        return;
      }
    }
    
    // Add user message
    const userMessage = createUserMessage(inputValue);
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);
    
    try {
      console.log(`Sending message for business ID ${business.id} in mode ${mode}: ${currentInput}`);
      
      // Save user message to database
      await saveChatMessage(conversationId, 'user', currentInput);
      
      // Pass the custom webhook URL and mode if provided
      const aiResponseData = await fetchAIResponse(currentInput, business, webhookUrl, mode);
      
      if (!aiResponseData.message) {
        throw new Error("Empty response received from webhook");
      }
      
      // Add AI response message with survey flag if applicable
      const assistantMessage = createAssistantMessage(
        aiResponseData.message, 
        aiResponseData.isSurveyRelated
      );
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save AI response to database
      await saveChatMessage(conversationId, 'assistant', aiResponseData.message, aiResponseData.isSurveyRelated);
      
    } catch (error) {
      console.error("Error fetching chat response:", error);
      toast.error("Failed to get AI response. Please try again.");
      
      // Add fallback AI message when webhook fails
      const fallbackMessage = createFallbackMessage();
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const setQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
  };
  
  const createSurvey = async (content: string): Promise<{ surveyId: string; shareableLink: string }> => {
    if (!business?.id) {
      toast.error("No business ID available to create survey");
      throw new Error("Missing business ID");
    }
    
    try {
      setIsLoading(true);
      const result = await createSurveyFromChat(`${content}:::${business.id}`);
      console.log("Survey created:", result);
      
      return result;
    } catch (error) {
      console.error("Error creating survey:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    conversations,
    currentConversationId,
    messages,
    inputValue,
    isLoading,
    isFetchingHistory,
    sendMessage,
    setInputValue,
    setQuickPrompt,
    createSurvey,
    createNewConversation,
    selectConversation
  };
};
