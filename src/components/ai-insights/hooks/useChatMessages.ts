
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Message } from "../types/message";
import { BusinessWithSurveyCount } from "@/components/business/BusinessForm";
import { fetchChatHistoryFromDB, saveChatMessageToDB, fetchAIResponse } from "../api/chatService";
import { createUserMessage, createAssistantMessage, createFallbackMessage } from "../utils/messageUtils";

export const useChatMessages = (business: BusinessWithSurveyCount) => {
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
      
      const aiResponse = await fetchAIResponse(currentInput, business);
      
      if (!aiResponse) {
        throw new Error("Empty response received from webhook");
      }
      
      // Add AI response message
      const assistantMessage = createAssistantMessage(aiResponse);
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save the conversation to the database
      await saveChatMessageToDB(business.id, currentInput, aiResponse);
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

  return {
    messages,
    inputValue,
    isLoading,
    isFetchingHistory,
    sendMessage,
    setInputValue,
    setQuickPrompt
  };
};
