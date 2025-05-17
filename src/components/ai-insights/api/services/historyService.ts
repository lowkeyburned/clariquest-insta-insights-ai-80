
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '../../types/message';

/**
 * Fetches chat history for a business from the database
 * @param businessId The ID of the business
 */
export const fetchChatHistoryFromDB = async (businessId: string): Promise<Message[]> => {
  try {
    // Check if we have a chat history in the chat_history table
    const { data: chatHistory, error: chatError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('session_id', businessId)
      .order('timestamp', { ascending: true });
    
    if (chatError) {
      console.error("Error fetching from chat_history:", chatError);
    } else if (chatHistory && chatHistory.length > 0) {
      // Transform the chat history into Message objects
      return chatHistory.map((item: any) => {
        // For user messages
        if (item.message && !item.ai_response) {
          return {
            id: item.id || uuidv4(),
            content: item.message || '',
            role: 'user',
            timestamp: new Date(item.timestamp),
            hasSurveyData: false
          };
        } 
        // For AI responses
        else if (item.ai_response) {
          return {
            id: item.id || uuidv4(),
            content: item.ai_response || '',
            role: 'assistant',
            timestamp: new Date(item.timestamp),
            hasSurveyData: (item.ai_response || '').includes('survey') || (item.ai_response || '').includes('Survey')
          };
        }
        return null;
      }).filter(Boolean) as Message[];
    }
    
    // If no chat history, check n8n_chat_histories
    const { data: n8nHistory, error: n8nError } = await supabase
      .from('n8n_chat_histories')
      .select('*')
      .eq('session_id', businessId)
      .order('id', { ascending: true });
    
    if (n8nError) {
      console.error("Error fetching from n8n_chat_histories:", n8nError);
      return [];
    }
    
    if (!n8nHistory || n8nHistory.length === 0) {
      return [];
    }
    
    // Transform n8n chat history into Message objects
    const messages: Message[] = [];
    
    for (const item of n8nHistory) {
      if (!item.message) continue;
      
      const messageData = typeof item.message === 'object' ? item.message : JSON.parse(item.message as any);
      
      if (messageData.user) {
        messages.push({
          id: `user_${uuidv4()}`,
          content: messageData.user,
          role: 'user',
          timestamp: new Date(messageData.timestamp || Date.now()),
          hasSurveyData: false
        });
      }
      
      if (messageData.ai) {
        messages.push({
          id: `ai_${uuidv4()}`,
          content: messageData.ai,
          role: 'assistant',
          timestamp: new Date(messageData.timestamp || Date.now()),
          hasSurveyData: (messageData.ai || '').includes('survey') || (messageData.ai || '').includes('Survey')
        });
      }
    }
    
    return messages;
    
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
};

/**
 * Saves a chat message exchange to the database
 * @param businessId The ID of the business
 * @param userMessage The message from the user
 * @param aiResponse The response from the AI
 */
export const saveChatMessageToDB = async (
  businessId: string,
  userMessage: string,
  aiResponse: string
): Promise<void> => {
  try {
    // First try to save to the n8n_chat_histories table
    const { error: n8nHistoryError } = await supabase
      .from('n8n_chat_histories')
      .insert({
        session_id: businessId,
        message: {
          user: userMessage,
          ai: aiResponse,
          timestamp: new Date().toISOString()
        },
        business_id: businessId // Use the business_id column
      });
    
    if (n8nHistoryError) {
      console.error("Error saving to n8n_chat_histories:", n8nHistoryError);
    }
    
    // Also save to the chat_history table for redundancy (using the correct schema)
    await Promise.all([
      supabase.from('chat_history').insert({
        session_id: businessId,
        message: userMessage,
        ai_response: "",
        timestamp: new Date().toISOString()
      }),
      supabase.from('chat_history').insert({
        session_id: businessId,
        message: "",
        ai_response: aiResponse,
        timestamp: new Date().toISOString()
      })
    ]);
    
  } catch (error) {
    console.error("Error saving chat message to DB:", error);
    throw error;
  }
};
