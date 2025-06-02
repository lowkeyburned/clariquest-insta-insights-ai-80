import { Message } from "../types/message";
import { supabase } from '@/integrations/supabase/client';
import { fetchAIResponse as fetchWebhookResponse, createSurveyFromChat as createSurveyFromChatWebhook } from './services/webhookService';
import { AutoSaveService } from './services/autoSaveService';
import { BusinessWithSurveyCount } from "@/utils/types/database";

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
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Transform DB records to Message objects
    return (data || []).map((record: any) => ({
      id: record.id,
      role: record.is_user_message ? 'user' : 'assistant',
      content: record.message,
      timestamp: new Date(record.created_at),
      hasSurveyData: !record.is_user_message && 
        (record.message.toLowerCase().includes('survey') || 
         record.message.toLowerCase().includes('questionnaire'))
    }));
    
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

/**
 * Saves a chat message to the database with auto-routing capability
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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Save user message
    if (userMessage) {
      await supabase
        .from('chat_history')
        .insert({
          business_id: businessId,
          user_id: user.id,
          message: userMessage,
          is_user_message: true
        });
    }

    // Save AI response
    if (aiResponse) {
      await supabase
        .from('chat_history')
        .insert({
          business_id: businessId,
          user_id: user.id,
          message: aiResponse,
          is_user_message: false
        });
    }
    
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};

/**
 * Fetches an AI response for a user message with auto-save capability
 * @param userMessage The message from the user
 * @param business The business data
 * @param webhookUrl Optional custom webhook URL
 */
export const fetchAIResponse = async (
  userMessage: string,
  business: BusinessWithSurveyCount,
  webhookUrl?: string
) => {
  const response = await fetchWebhookResponse(userMessage, business, webhookUrl);
  
  // Auto-save any structured data from the AI response
  try {
    await AutoSaveService.processAIResponse(response.message, business, userMessage);
  } catch (error) {
    console.error('Auto-save failed, but continuing with chat response:', error);
    // Don't throw - auto-save failure shouldn't break the chat
  }
  
  return response;
};

/**
 * Creates a survey based on AI chat content
 * @param combinedData The AI content and business ID
 */
export const createSurveyFromChat = async (combinedData: string): Promise<{ surveyId: string; shareableLink: string }> => {
  return createSurveyFromChatWebhook(combinedData);
};
