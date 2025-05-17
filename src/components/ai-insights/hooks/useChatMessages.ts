
import { useState } from "react";
import { toast } from "sonner";
import { Message } from "../types/message";
import { BusinessWithSurveyCount } from "@/components/business/BusinessForm";

export const useChatMessages = (business: BusinessWithSurveyCount) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      await fetchChatResponse(currentInput);
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

  const fetchChatResponse = async (query: string) => {
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
      
      // Use the new webhook URL provided by the user
      const webhookUrl = "http://localhost:5678/webhook/fa910689-c7eb-420d-861b-890cec67ba97/chat";
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors", // Try with standard CORS first
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Mock response for testing if the actual response can't be parsed
      let data;
      try {
        data = await response.json();
        console.log("Webhook response received:", data);
      } catch (error) {
        console.error("Error parsing webhook response:", error);
        // If we can't parse the response, create a mock response
        data = {
          message: "This is a mock response because the actual response couldn't be parsed.",
          success: true
        };
      }
      
      // Check if the response has survey-related content
      const isSurveyRelated = 
        data.message?.toLowerCase().includes("survey") || 
        data.message?.toLowerCase().includes("question");
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message || "Sorry, I received an empty response.",
        timestamp: new Date(),
        hasSurveyData: isSurveyRelated
      };
      
      setMessages((prev) => [...prev, aiMessage]);
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
    sendMessage,
    setInputValue,
    setQuickPrompt
  };
};
