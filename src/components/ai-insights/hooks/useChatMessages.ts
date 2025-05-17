
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Message } from "../types/message";
import { BusinessWithSurveyCount } from "@/components/business/BusinessForm";
import { supabase } from "@/integrations/supabase/client";

export const useChatMessages = (business: BusinessWithSurveyCount) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);

  // Fetch chat history when the component mounts or business changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!business?.id) return;
      
      setIsFetchingHistory(true);
      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('session_id', business.id)
          .order('timestamp', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          const formattedMessages: Message[] = [];
          
          data.forEach(chat => {
            // Add user message
            formattedMessages.push({
              id: `user-${chat.id}`,
              role: "user",
              content: chat.message,
              timestamp: new Date(chat.timestamp),
            });
            
            // Add AI response
            formattedMessages.push({
              id: `ai-${chat.id}`,
              role: "assistant",
              content: chat.ai_response,
              timestamp: new Date(chat.timestamp),
              hasSurveyData: chat.ai_response.toLowerCase().includes("survey") || 
                            chat.ai_response.toLowerCase().includes("question")
            });
          });
          
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
        toast.error("Failed to load chat history.");
      } finally {
        setIsFetchingHistory(false);
      }
    };
    
    fetchChatHistory();
  }, [business?.id]);

  const saveMessageToDatabase = async (userMessage: string, aiResponse: string) => {
    try {
      const { error } = await supabase
        .from('chat_history')
        .insert({
          session_id: business.id || "",
          message: userMessage,
          ai_response: aiResponse
        });
        
      if (error) throw error;
    } catch (error) {
      console.error("Error saving chat to database:", error);
      // We don't show a toast here as it would be distracting
      // The chat still works in the UI even if saving fails
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue; // Store the current input value
    setInputValue("");
    setIsLoading(true);
    
    try {
      const aiResponse = await fetchChatResponse(currentInput);
      // Save the conversation to the database
      if (aiResponse) {
        await saveMessageToDatabase(currentInput, aiResponse);
      }
    } catch (error) {
      console.error("Error fetching chat response:", error);
      toast.error("Failed to get AI response. Please try again.");
      
      // Add fallback AI message when webhook fails
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I couldn't connect to the AI service. Please check your webhook connection and try again.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChatResponse = async (query: string): Promise<string> => {
    try {
      console.log("Preparing webhook request for:", query);
      
      // Create the request payload with all required data
      const payload = {
        message: query,
        businessName: business.name,
        businessId: business.id || "",
        businessDescription: business.description || "",
      };
      
      console.log("Request payload:", payload);
      
      // Use the webhook URL for AI Insights
      const webhookUrl = "http://localhost:5678/webhook-test/ab4a8a3c-0b5a-4728-9983-25caff5d1b9c";
      
      console.log("Sending request to webhook URL:", webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "omit", // Don't send cookies to avoid CORS issues
        mode: "cors", 
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
        console.log("Webhook response received:", data);
      } catch (error) {
        console.error("Error parsing webhook response:", error);
        throw new Error("Failed to parse response from webhook");
      }
      
      if (!data || !data.message) {
        throw new Error("Invalid response format from webhook");
      }
      
      // Check if the response has survey-related content
      const isSurveyRelated = 
        data.message?.toLowerCase().includes("survey") || 
        data.message?.toLowerCase().includes("question");
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        hasSurveyData: isSurveyRelated
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      return data.message;
    } catch (error) {
      console.error("Error in fetchChatResponse:", error);
      throw error; // Re-throw the error to be handled by the caller
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
