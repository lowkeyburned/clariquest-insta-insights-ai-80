
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
    // Fetch from chat_history table
    const { data: chatHistory, error: chatError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });
    
    if (chatError) {
      console.error("Error fetching from chat_history:", chatError);
      return [];
    }
    
    if (chatHistory && chatHistory.length > 0) {
      return chatHistory.map((item: any) => ({
        id: item.id || uuidv4(),
        content: item.message || '',
        role: (item.is_user_message ? 'user' : 'assistant') as 'user' | 'assistant',
        timestamp: new Date(item.created_at),
        hasSurveyData: !item.is_user_message && (item.message || '').toLowerCase().includes('survey')
      }));
    }
    
    // If no chat history, check n8n_chat_histories
    const { data: n8nHistory, error: n8nError } = await supabase
      .from('n8n_chat_histories')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });
    
    if (n8nError) {
      console.error("Error fetching from n8n_chat_histories:", n8nError);
      return [];
    }
    
    if (!n8nHistory || n8nHistory.length === 0) {
      return [];
    }
    
    return n8nHistory.map((item: any) => ({
      id: item.id || uuidv4(),
      content: item.message || '',
      role: (item.is_user_message ? 'user' : 'assistant') as 'user' | 'assistant',
      timestamp: new Date(item.created_at),
      hasSurveyData: !item.is_user_message && (item.message || '').toLowerCase().includes('survey')
    }));
  }, `Fetching chat history for business ${businessId} in ${mode} mode`);
  
  return result.success ? (result.data || []) : [];
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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Save user message
    if (userMessage?.trim()) {
      await supabase.from('chat_history').insert({
        business_id: businessId,
        user_id: user.id,
        message: userMessage,
        is_user_message: true
      });
    }
    
    // Save AI response
    if (aiResponse?.trim()) {
      await supabase.from('chat_history').insert({
        business_id: businessId,
        user_id: user.id,
        message: aiResponse,
        is_user_message: false
      });
    }
    
    return true;
  }, `Saving chat message for business ${businessId} in ${mode} mode`);
};
