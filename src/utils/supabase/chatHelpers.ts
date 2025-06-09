
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/ai-insights/types/message';

export interface ChatConversation {
  id: string;
  business_id: string;
  title: string;
  mode: 'survey' | 'chart' | 'chat-db';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  has_survey_data: boolean;
  created_at: string;
}

/**
 * Creates a new chat conversation
 */
export const createChatConversation = async (
  businessId: string, 
  mode: 'survey' | 'chart' | 'chat-db',
  title?: string
): Promise<ChatConversation> => {
  const defaultTitle = `${mode.charAt(0).toUpperCase() + mode.slice(1)} Chat - ${new Date().toLocaleDateString()}`;
  
  const { data, error } = await supabase
    .from('ai_chat_conversations')
    .insert({
      business_id: businessId,
      mode,
      title: title || defaultTitle
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }

  return data as ChatConversation;
};

/**
 * Fetches all conversations for a business
 */
export const fetchChatConversations = async (
  businessId: string,
  mode?: 'survey' | 'chart' | 'chat-db'
): Promise<ChatConversation[]> => {
  let query = supabase
    .from('ai_chat_conversations')
    .select('*')
    .eq('business_id', businessId)
    .order('updated_at', { ascending: false });

  if (mode) {
    query = query.eq('mode', mode);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }

  return (data || []) as ChatConversation[];
};

/**
 * Fetches messages for a conversation
 */
export const fetchChatMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('ai_chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return (data || []).map((msg) => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    timestamp: new Date(msg.created_at),
    hasSurveyData: msg.has_survey_data
  }));
};

/**
 * Saves a message to a conversation
 */
export const saveChatMessage = async (
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  hasSurveyData: boolean = false
): Promise<void> => {
  const { error } = await supabase
    .from('ai_chat_messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      has_survey_data: hasSurveyData
    });

  if (error) {
    console.error('Error saving message:', error);
    throw error;
  }

  // Update conversation's updated_at timestamp
  await supabase
    .from('ai_chat_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);
};

/**
 * Updates conversation title
 */
export const updateConversationTitle = async (
  conversationId: string,
  title: string
): Promise<void> => {
  const { error } = await supabase
    .from('ai_chat_conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (error) {
    console.error('Error updating conversation title:', error);
    throw error;
  }
};

/**
 * Deletes a conversation and all its messages
 */
export const deleteChatConversation = async (conversationId: string): Promise<void> => {
  const { error } = await supabase
    .from('ai_chat_conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};
