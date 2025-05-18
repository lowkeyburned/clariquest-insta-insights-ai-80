
import { Message } from "../types/message";
import { supabase } from '@/integrations/supabase/client';
import { fetchAIResponse as fetchWebhookResponse, createSurveyFromChat as createSurveyFromChatWebhook } from './services/webhookService';
import { BusinessWithSurveyCount } from "@/components/business/BusinessForm";

/**
 * Fetches chat history for a business from the database
 * @param businessId The ID of the business
 * @param mode The chat mode (survey, chart, chat-db)
 */
export const fetchChatHistoryFromDB = async (businessId: string, mode: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('session_id', `${businessId}_${mode}`)
      .order('timestamp', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Transform DB records to Message objects
    return data.map((record: any) => {
      // Alternate between user and assistant messages for proper display
      const isUserMessage = data.indexOf(record) % 2 === 0;
      return {
        id: record.id,
        role: isUserMessage ? 'user' : 'assistant',
        content: isUserMessage ? record.message : record.ai_response,
        timestamp: record.timestamp,
        hasSurveyData: !isUserMessage && 
          (record.ai_response.toLowerCase().includes('survey') || 
           record.ai_response.toLowerCase().includes('questionnaire'))
      };
    });
    
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

/**
 * Saves a chat message and its response to the database
 * @param businessId The ID of the business
 * @param userMessage The message from the user
 * @param aiResponse The response from the AI
 * @param mode The chat mode (survey, chart, chat-db)
 */
export const saveChatMessageToDB = async (
  businessId: string,
  userMessage: string,
  aiResponse: string,
  mode: string
): Promise<void> => {
  try {
    const sessionId = `${businessId}_${mode}`;
    
    // Save the message pair to the database
    const { error } = await supabase
      .from('chat_history')
      .insert([
        {
          session_id: sessionId,
          message: userMessage,
          ai_response: aiResponse
        }
      ]);
    
    if (error) {
      throw error;
    }
    
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};

/**
 * Fetches an AI response for a user message
 * @param userMessage The message from the user
 * @param business The business data
 * @param webhookUrl Optional custom webhook URL
 */
export const fetchAIResponse = async (
  userMessage: string,
  business: BusinessWithSurveyCount,
  webhookUrl?: string
) => {
  return fetchWebhookResponse(userMessage, business, webhookUrl);
};

/**
 * Creates a survey based on AI chat content
 * @param combinedData The AI content and business ID
 */
export const createSurveyFromChat = async (combinedData: string): Promise<string> => {
  return createSurveyFromChatWebhook(combinedData);
};
