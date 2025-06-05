
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../../types/message';

// In-memory storage for chat history (since we removed chat history tables)
const chatHistoryStorage = new Map<string, Message[]>();

/**
 * Fetches chat history for a business from memory storage
 * @param businessId The ID of the business
 * @param mode The chat mode (survey, chart, chat-db)
 */
export const fetchChatHistoryFromDB = async (businessId: string, mode: string = 'survey'): Promise<Message[]> => {
  if (!businessId) {
    console.warn('Business ID is required for fetching chat history');
    return [];
  }
  
  try {
    // Return chat history from memory storage
    return chatHistoryStorage.get(businessId) || [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
};

/**
 * Saves a chat message exchange to memory storage
 * @param businessId The ID of the business
 * @param userMessage The message from the user
 * @param aiResponse The response from the AI
 * @param mode The chat mode (survey, chart, chat-db)
 */
export const saveChatMessageToDB = async (
  businessId: string,
  userMessage: string,
  aiResponse: string,
  mode: string = 'survey'
): Promise<void> => {
  if (!businessId) {
    throw new Error('Business ID is required');
  }
  
  if (!userMessage?.trim() && !aiResponse?.trim()) {
    throw new Error('Either user message or AI response is required');
  }
  
  try {
    const existingHistory = chatHistoryStorage.get(businessId) || [];
    
    // Add user message if provided
    if (userMessage?.trim()) {
      existingHistory.push({
        id: `user-${Date.now()}-${Math.random()}`,
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
        hasSurveyData: false
      });
    }
    
    // Add AI response if provided
    if (aiResponse?.trim()) {
      existingHistory.push({
        id: `ai-${Date.now()}-${Math.random()}`,
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
