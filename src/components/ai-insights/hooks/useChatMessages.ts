
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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChatResponse = async (query: string) => {
    try {
      console.log("Sending request to webhook:", query);
      const response = await fetch("http://localhost:5678/webhook/ab4a8a3c-0b5a-4728-9983-25caff5d1b9c", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: query,
          businessName: business.name,
          businessId: business.id || "",
          businessDescription: business.description || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if the response has survey-related content
      const isSurveyRelated = 
        data.message.toLowerCase().includes("survey") || 
        data.message.toLowerCase().includes("question");
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
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
