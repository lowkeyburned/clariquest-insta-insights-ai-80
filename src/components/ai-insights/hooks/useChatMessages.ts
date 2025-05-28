
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Message } from "../types/message";
import { BusinessWithSurveyCount } from "@/utils/types/database";
import { fetchChatHistoryFromDB, saveChatMessageToDB, fetchAIResponse, createSurveyFromChat } from "../api/chatService";
import { createUserMessage, createAssistantMessage, createFallbackMessage } from "../utils/messageUtils";

interface UseChatMessagesProps {
  business: BusinessWithSurveyCount;
  webhookUrl?: string;
  mode: "survey" | "chart" | "chat-db";
}

export const useChatMessages = ({ business, webhookUrl, mode }: UseChatMessagesProps) => {
  // Create a map to store separate message histories for each mode
  const [messagesMap, setMessagesMap] = useState<{
    survey: Message[];
    chart: Message[];
    "chat-db": Message[];
  }>({
    survey: [],
    chart: [],
    "chat-db": [],
  });
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);

  // Get the current messages based on the active mode
  const messages = messagesMap[mode];

  // Fetch chat history when the component mounts, business changes, or mode changes
  useEffect(() => {
    if (!business?.id) {
      console.warn("No business ID available to fetch chat history");
      setIsFetchingHistory(false);
      return;
    }
    
    const loadChatHistory = async () => {
      setIsFetchingHistory(true);
      try {
        console.log(`Loading chat history for business ID: ${business.id} in mode: ${mode}`);
        
        // Additional logging for the specific business from the screenshot
        if (business.id === "429ba186-2307-41e6-8340-66b1cfe5d576") {
          console.log("Loading chat history for Listmybusiness");
        }
        
        const history = await fetchChatHistoryFromDB(business.id, mode);
        
        // Update only the messages for the current mode
        setMessagesMap(prev => ({
          ...prev,
          [mode]: history
        }));
      } catch (error) {
        console.error("Error fetching chat history:", error);
        toast.error("Failed to load chat history.");
      } finally {
        setIsFetchingHistory(false);
      }
    };
    
    loadChatHistory();
  }, [business?.id, mode]);

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
    
    // Update only the messages for the current mode
    setMessagesMap(prev => ({
      ...prev,
      [mode]: [...prev[mode], userMessage]
    }));
    
    const currentInput = inputValue; // Store the current input value
    setInputValue("");
    setIsLoading(true);
    
    try {
      console.log(`Sending message for business ID ${business.id} in mode ${mode}: ${currentInput}`);
      
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
      
      // Update only the messages for the current mode
      setMessagesMap(prev => ({
        ...prev,
        [mode]: [...prev[mode], assistantMessage]
      }));
      
      // Save the conversation to the database with the mode
      await saveChatMessageToDB(business.id, currentInput, aiResponseData.message, mode);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      toast.error("Failed to get AI response. Please try again.");
      
      // Add fallback AI message when webhook fails
      const fallbackMessage = createFallbackMessage();
      
      // Update only the messages for the current mode
      setMessagesMap(prev => ({
        ...prev,
        [mode]: [...prev[mode], fallbackMessage]
      }));
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
      // Pass content and business.id as a single combined string with a separator
      const result = await createSurveyFromChat(`${content}:::${business.id}`);
      console.log("Survey created:", result);
      
      // Return the full result object with surveyId and shareableLink
      return result;
    } catch (error) {
      console.error("Error creating survey:", error);
      throw error;
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
