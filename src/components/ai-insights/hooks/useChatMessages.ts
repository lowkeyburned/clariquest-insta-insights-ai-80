
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Message } from "../types/message";
import { BusinessWithSurveyCount } from "@/components/business/BusinessForm";
import { fetchChatHistoryFromDB, saveChatMessageToDB, fetchAIResponse, createSurveyFromChat } from "../api/chatService";
import { createUserMessage, createAssistantMessage, createFallbackMessage } from "../utils/messageUtils";

interface UseChatMessagesProps {
  business: BusinessWithSurveyCount;
  webhookUrl?: string;
}

export const useChatMessages = ({ business, webhookUrl }: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);

  // Fetch chat history when the component mounts or business changes
  useEffect(() => {
    if (!business?.id) {
      console.warn("No business ID available to fetch chat history");
      setIsFetchingHistory(false);
      return;
    }
    
    const loadChatHistory = async () => {
      setIsFetchingHistory(true);
      try {
        console.log(`Loading chat history for business ID: ${business.id}`);
        
        // Additional logging for the specific business from the screenshot
        if (business.id === "429ba186-2307-41e6-8340-66b1cfe5d576") {
          console.log("Loading chat history for Listmybusiness");
        }
        
        const history = await fetchChatHistoryFromDB(business.id);
        setMessages(history);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        toast.error("Failed to load chat history.");
      } finally {
        setIsFetchingHistory(false);
      }
    };
    
    loadChatHistory();
  }, [business?.id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    if (!business?.id) {
      console.error("No business ID available for sending message");
      toast.error("Please select a valid business before sending messages.");
      return;
    }
    
    // Add user message
    const userMessage = createUserMessage(inputValue);
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = inputValue; // Store the current input value
    setInputValue("");
    setIsLoading(true);
    
    try {
      console.log(`Sending message for business ID ${business.id}: ${currentInput}`);
      
      // Additional logging for the specific business from the screenshot
      if (business.id === "429ba186-2307-41e6-8340-66b1cfe5d576") {
        console.log("Sending message for Listmybusiness");
      }
      
      // Pass the custom webhook URL if provided and get enhanced response
      const aiResponseData = await fetchAIResponse(currentInput, business, webhookUrl);
      
      if (!aiResponseData.message) {
        throw new Error("Empty response received from webhook");
      }
      
      // Add AI response message with survey flag if applicable
      const assistantMessage = createAssistantMessage(
        aiResponseData.message, 
        aiResponseData.isSurveyRelated
      );
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save the conversation to the database
      await saveChatMessageToDB(business.id, currentInput, aiResponseData.message);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      toast.error("Failed to get AI response. Please try again.");
      
      // Add fallback AI message when webhook fails
      const fallbackMessage = createFallbackMessage();
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const setQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
  };
  
  const createSurvey = async (content: string) => {
    if (!business?.id) {
      toast.error("No business ID available to create survey");
      return;
    }
    
    try {
      setIsLoading(true);
      // Fix: Call createSurveyFromChat with just one combined argument
      const result = await createSurveyFromChat(`${content}:::${business.id}`);
      toast.success("Survey creation initiated. Check surveys tab soon.");
      console.log("Survey creation payload:", result);
      
      // In a real implementation, you would redirect to the surveys page
      // or show a confirmation with more details
    } catch (error) {
      console.error("Error creating survey:", error);
      toast.error("Failed to create survey. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    inputValue,
    isLoading,
    isFetchingHistory,
    sendMessage,
    setInputValue,
    setQuickPrompt,
    createSurvey
  };
};
