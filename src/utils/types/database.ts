
// Comprehensive type definitions for all 17 Supabase tables

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'business_owner' | 'team_member';
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: 'manager' | 'viewer';
  permissions?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Survey {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  is_active?: boolean;
  slug?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  questions?: SurveyQuestion[];
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: 'likert' | 'yes_no' | 'multiple_choice' | 'text' | 'single_choice' | 'open_ended' | 'slider' | 'multiple_select';
  required?: boolean;
  order_index?: number;
  options?: Record<string, any> | string[] | null;
  created_at: string;
  updated_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  user_id?: string;
  responses: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ResponseAnswer {
  id: string;
  response_id: string;
  question_id: string;
  answer: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SurveyTemplate {
  id: string;
  name: string;
  description?: string;
  template_data: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SurveyShare {
  id: string;
  survey_id: string;
  share_token: string;
  expires_at?: string;
  access_count?: number;
  created_at: string;
  updated_at: string;
}

export interface InstagramCampaign {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  created_by: string;
  survey_link?: string;
  target_location?: string;
  reach_numbers?: number;
  message_content?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignTarget {
  id: string;
  campaign_id: string;
  target_user_id: string;
  target_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  metrics: Record<string, any>;
  date: string;
  engagement_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CampaignSurveyLink {
  id: string;
  campaign_id: string;
  survey_id: string;
  survey_link: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessIntegration {
  id: string;
  business_id: string;
  platform: 'instagram' | 'n8n';
  api_keys: Record<string, any>;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatHistory {
  id: string;
  business_id: string;
  user_id: string;
  message: string;
  is_user_message: boolean;
  created_at: string;
  updated_at: string;
}

export interface N8nChatHistory {
  id: string;
  business_id: string;
  user_id: string;
  message: string;
  is_user_message: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  read_status?: boolean;
  created_at: string;
  updated_at: string;
}

// Utility types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BusinessWithSurveyCount extends Business {
  survey_count?: number;
}

export interface SurveyWithQuestions extends Survey {
  questions: SurveyQuestion[];
}

export interface CampaignWithTargets extends InstagramCampaign {
  targets?: CampaignTarget[];
  analytics?: CampaignAnalytics[];
}

export interface CampaignWithSurveyLinks extends InstagramCampaign {
  survey_links?: CampaignSurveyLink[];
}
