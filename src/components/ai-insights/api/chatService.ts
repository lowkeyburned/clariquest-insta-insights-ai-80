
import { supabase } from "@/integrations/supabase/client";
import { Message } from "../types/message";
import { BusinessWithSurveyCount } from "@/components/business/BusinessForm";

/**
 * Fetches chat history for a specific business from the database
 */
export const fetchChatHistoryFromDB = async (businessId: string) => {
  if (!businessId) {
    console.error("No business ID provided for fetching chat history");
    return [];
  }
  
  console.log("Fetching chat history for business:", businessId);
  
  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('session_id', businessId)
    .order('timestamp', { ascending: true });
    
  if (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
  
  if (!data || data.length === 0) return [];
  
  // Format the database records into Message objects
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
  
  console.log(`Found ${formattedMessages.length} messages for business ${businessId}`);
  return formattedMessages;
};

/**
 * Saves a chat message and response to the database
 */
export const saveChatMessageToDB = async (businessId: string, userMessage: string, aiResponse: string) => {
  if (!businessId) {
    console.error("No business ID provided for saving chat message");
    return false;
  }
  
  console.log(`Saving chat for business ${businessId}`);
  
  try {
    // Save to chat_history table
    const { error: chatHistoryError } = await supabase
      .from('chat_history')
      .insert({
        session_id: businessId,
        message: userMessage,
        ai_response: aiResponse
      });
      
    if (chatHistoryError) {
      console.error("Error saving to chat_history:", chatHistoryError);
      throw chatHistoryError;
    }

    // Also save to n8n_chat_histories table with explicit business_id field
    const { error: n8nHistoryError } = await supabase
      .from('n8n_chat_histories')
      .insert({
        session_id: businessId, // This is the business ID
        message: {
          business_id: businessId, // Explicitly include business_id in the JSON message
          user: userMessage,
          ai: aiResponse,
          timestamp: new Date().toISOString()
        },
        business_id: businessId // Use the new business_id column
      });
    
    if (n8nHistoryError) {
      console.error("Error saving to n8n_chat_histories:", n8nHistoryError);
      // Don't throw error here so it won't break the normal flow if this fails
    }
    
    return true;
  } catch (error) {
    console.error("Error saving chat to database:", error);
    return false;
  }
};

/**
 * Fetches an AI response from the webhook
 */
export const fetchAIResponse = async (query: string, business: BusinessWithSurveyCount) => {
  if (!business?.id) {
    console.error("No business ID available for AI response");
    throw new Error("Business ID is required for fetching AI response");
  }
  
  console.log(`Preparing webhook request for business ${business.id}: ${query}`);
  
  // Create the request payload with all required data
  const payload = {
    message: query,
    businessName: business.name,
    businessId: business.id,
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
  
  // Check for response or response.message to support various webhook formats
  if (data?.message) {
    return data.message;
  } else if (data?.response) {
    return data.response;
  } else if (typeof data === 'string') {
    return data;
  } else if (typeof data === 'object' && Object.keys(data).length > 0) {
    // Try to find any string property in the response that might contain our message
    const firstStringProp = Object.values(data).find(val => typeof val === 'string');
    if (firstStringProp) {
      return firstStringProp as string;
    }
  }
  
  throw new Error("Invalid response format from webhook");
};
