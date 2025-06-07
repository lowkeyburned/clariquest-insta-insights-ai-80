
import { Message } from "../types/message";
import { fetchAIResponse as fetchWebhookResponse, createSurveyFromChat as createSurveyFromChatWebhook } from './services/webhookService';
import { AutoSaveService } from './services/autoSaveService';
import { BusinessWithSurveyCount } from "@/utils/types/database";

// In-memory storage for chat history (since we removed the chat_history table)
const chatHistoryStorage = new Map<string, Message[]>();

/**
 * Fetches chat history for a business from memory storage
 * @param businessId The ID of the business
 * @param mode The chat mode (survey, chart, chat-db)
 */
export const fetchChatHistoryFromDB = async (businessId: string, mode: string): Promise<Message[]> => {
  try {
    // Return chat history from memory storage
    return chatHistoryStorage.get(businessId) || [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

/**
 * Saves a chat message to memory storage
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
    const existingHistory = chatHistoryStorage.get(businessId) || [];
    
    // Add user message if provided
    if (userMessage) {
      existingHistory.push({
        id: `user-${Date.now()}`,
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
        hasSurveyData: false
      });
    }

    // Add AI response if provided
    if (aiResponse) {
      existingHistory.push({
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        hasSurveyData: aiResponse.toLowerCase().includes('survey')
      });
    }
    
    // Store back to memory
    chatHistoryStorage.set(businessId, existingHistory);
    
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
 * @param mode The AI mode to determine which webhook to use
 */
export const fetchAIResponse = async (
  userMessage: string,
  business: BusinessWithSurveyCount,
  webhookUrl?: string,
  mode?: 'survey' | 'chart' | 'chat-db'
) => {
  const response = await fetchWebhookResponse(userMessage, business, webhookUrl, mode);
  
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
