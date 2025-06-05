
// Comprehensive type definitions for the remaining 8 active Supabase tables

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

export interface CampaignSurveyLink {
  id: string;
  campaign_id: string;
  survey_id: string;
  survey_link: string;
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

export interface CampaignWithSurveyLinks extends InstagramCampaign {
  survey_links?: CampaignSurveyLink[];
}
