
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '../../types/message';
import { handleSupabaseError, wrapSupabaseOperation } from '@/utils/supabase/errorHandler';

/**
 * Fetches chat history for a business from the database with comprehensive error handling
 * @param businessId The ID of the business
 * @param mode The chat mode (survey, chart, chat-db)
 */
export const fetchChatHistoryFromDB = async (businessId: string, mode: string = 'survey'): Promise<Message[]> => {
  if (!businessId) {
    console.warn('Business ID is required for fetching chat history');
    return [];
  }
  
  const result = await wrapSupabaseOperation(async () => {
    // Create a session ID that includes both business ID and mode
    const sessionId = `${businessId}_${mode}`;
    
    // Check if we have a chat history in the chat_history table
    const { data: chatHistory, error: chatError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('session_id', sessionId)
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
    
    // If no chat history in the new format, try the old format without mode
    if (!chatHistory || chatHistory.length === 0) {
      const { data: oldChatHistory, error: oldChatError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('session_id', businessId)
        .order('timestamp', { ascending: true });
        
      if (!oldChatError && oldChatHistory && oldChatHistory.length > 0 && mode === 'survey') {
        // Only return old history for survey mode
        return oldChatHistory.map((item: any) => {
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
    }
    
    // If no chat history, check n8n_chat_histories with the mode
    const n8nSessionId = `${businessId}_${mode}`;
    const { data: n8nHistory, error: n8nError } = await supabase
      .from('n8n_chat_histories')
      .select('*')
      .eq('session_id', n8nSessionId)
      .order('id', { ascending: true });
    
    if (n8nError) {
      console.error("Error fetching from n8n_chat_histories:", n8nError);
      
      // If error or no results with mode, try without mode (for backward compatibility)
      if (mode === 'survey') {
        const { data: oldN8nHistory } = await supabase
          .from('n8n_chat_histories')
          .select('*')
          .eq('session_id', businessId)
          .order('id', { ascending: true });
          
        if (oldN8nHistory && oldN8nHistory.length > 0) {
          return formatN8nChatHistory(oldN8nHistory);
        }
      }
      
      return [];
    }
    
    if (!n8nHistory || n8nHistory.length === 0) {
      return [];
    }
    
    return formatN8nChatHistory(n8nHistory);
  }, `Fetching chat history for business ${businessId} in ${mode} mode`);
  
  return result.success ? (result.data || []) : [];
};

// Helper function to format n8n chat history
const formatN8nChatHistory = (n8nHistory: any[]): Message[] => {
  const messages: Message[] = [];
  
  try {
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
  } catch (error) {
    console.error('Error parsing n8n chat history:', error);
  }
  
  return messages;
};

/**
 * Saves a chat message exchange to the database with comprehensive error handling
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
  
  await wrapSupabaseOperation(async () => {
    // Create a session ID that includes both business ID and mode
    const sessionId = `${businessId}_${mode}`;
    
    // First try to save to the n8n_chat_histories table
    const { error: n8nHistoryError } = await supabase
      .from('n8n_chat_histories')
      .insert({
        session_id: sessionId,
        message: {
          user: userMessage,
          ai: aiResponse,
          timestamp: new Date().toISOString(),
          mode: mode
        },
        business_id: businessId // Use the business_id column
      });
    
    if (n8nHistoryError) {
      console.error("Error saving to n8n_chat_histories:", n8nHistoryError);
    }
    
    // Also save to the chat_history table for redundancy (using the correct schema)
    const chatHistoryPromises = [];
    
    if (userMessage?.trim()) {
      chatHistoryPromises.push(
        supabase.from('chat_history').insert({
          session_id: sessionId,
          message: userMessage,
          ai_response: "",
          timestamp: new Date().toISOString()
        })
      );
    }
    
    if (aiResponse?.trim()) {
      chatHistoryPromises.push(
        supabase.from('chat_history').insert({
          session_id: sessionId,
          message: "",
          ai_response: aiResponse,
          timestamp: new Date().toISOString()
        })
      );
    }
    
    await Promise.all(chatHistoryPromises);
    
    return true;
  }, `Saving chat message for business ${businessId} in ${mode} mode`);
};
