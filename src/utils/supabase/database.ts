
import { supabase } from '@/integrations/supabase/client';
import {
  Profile,
  UserRole,
  Business,
  Survey,
  SurveyQuestion,
  SurveyResponse,
  InstagramCampaign,
  ApiResponse,
  BusinessWithSurveyCount,
  SurveyWithQuestions
} from '../types/database';

// Auth utilities
export const getCurrentUser = async (): Promise<ApiResponse<Profile>> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return { success: false, error: 'Not authenticated' };
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) throw profileError;
    return { success: true, data: profile };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUserRole = async (userId?: string): Promise<ApiResponse<UserRole>> => {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) return { success: false, error: 'User ID required' };
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();
    
    if (error) throw error;
    
    // Type cast the role properly
    const userRole: UserRole = {
      ...data,
      role: data.role as 'admin' | 'business_owner' | 'team_member'
    };
    
    return { success: true, data: userRole };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Profile functions
export const updateProfile = async (id: string, updates: Partial<Profile>): Promise<ApiResponse<Profile>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Business functions
export const fetchBusinessesForUser = async (): Promise<ApiResponse<BusinessWithSurveyCount[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };
    
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        surveys!inner(count)
      `)
      .eq('owner_id', user.id);
    
    if (error) throw error;
    
    const businessesWithCount: BusinessWithSurveyCount[] = (data || []).map(business => ({
      ...business,
      website: business.website || null,
      survey_count: business.surveys?.length || 0
    }));
    
    return { success: true, data: businessesWithCount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const fetchBusinessById = async (id: string): Promise<ApiResponse<Business>> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const createBusiness = async (business: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Business>> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .insert([business])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateBusiness = async (id: string, updates: Partial<Business>): Promise<ApiResponse<Business>> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Survey functions
export const fetchSurveysForBusiness = async (businessId: string): Promise<ApiResponse<Survey[]>> => {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const fetchSurveyById = async (surveyId: string): Promise<ApiResponse<SurveyWithQuestions>> => {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select(`
        *,
        questions:survey_questions (*)
      `)
      .eq('id', surveyId)
      .single();
    
    if (error) throw error;
    
    // Transform the raw database questions to match our SurveyQuestion type
    const transformedQuestions: SurveyQuestion[] = (data.questions || []).map((q: any) => ({
      id: q.id,
      survey_id: q.survey_id,
      question_text: q.question_text,
      question_type: q.question_type as SurveyQuestion['question_type'],
      options: q.options as string[] | Record<string, any> | null,
      required: q.required,
      order_index: q.order_index,
      created_at: q.created_at,
      updated_at: q.updated_at,
    })).sort((a: SurveyQuestion, b: SurveyQuestion) => (a.order_index || 0) - (b.order_index || 0));
    
    const surveyWithQuestions: SurveyWithQuestions = {
      ...data,
      questions: transformedQuestions
    };
    
    return { success: true, data: surveyWithQuestions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const fetchSurveyBySlug = async (slug: string): Promise<ApiResponse<SurveyWithQuestions>> => {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select(`
        *,
        questions:survey_questions (*)
      `)
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    
    // Transform the raw database questions to match our SurveyQuestion type
    const transformedQuestions: SurveyQuestion[] = (data.questions || []).map((q: any) => ({
      id: q.id,
      survey_id: q.survey_id,
      question_text: q.question_text,
      question_type: q.question_type as SurveyQuestion['question_type'],
      options: q.options as string[] | Record<string, any> | null,
      required: q.required,
      order_index: q.order_index,
      created_at: q.created_at,
      updated_at: q.updated_at,
    })).sort((a: SurveyQuestion, b: SurveyQuestion) => (a.order_index || 0) - (b.order_index || 0));
    
    const surveyWithQuestions: SurveyWithQuestions = {
      ...data,
      questions: transformedQuestions
    };
    
    return { success: true, data: surveyWithQuestions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const createSurvey = async (survey: Omit<Survey, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Survey>> => {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .insert([survey])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Survey response functions with proper authentication handling
export const saveSurveyResponse = async (
  surveyId: string, 
  answers: Record<string, any>
): Promise<ApiResponse<SurveyResponse>> => {
  try {
    // Get current user (may be null for anonymous responses)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Create the survey response
    const responseData = {
      survey_id: surveyId,
      user_id: user?.id || null, // Allow null for anonymous responses
      responses: answers,
    };
    
    const { data: response, error: responseError } = await supabase
      .from('survey_responses')
      .insert([responseData])
      .select()
      .single();
    
    if (responseError) throw responseError;
    
    // Transform the response to match our type
    const transformedResponse: SurveyResponse = {
      ...response,
      responses: response.responses as Record<string, any>
    };
    
    return { success: true, data: transformedResponse };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const fetchSurveyResponses = async (surveyId: string): Promise<ApiResponse<SurveyResponse[]>> => {
  try {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform responses to match our type
    const transformedResponses: SurveyResponse[] = (data || []).map(response => ({
      ...response,
      responses: response.responses as Record<string, any>
    }));
    
    return { success: true, data: transformedResponses };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Instagram campaign functions
export const fetchCampaignsForBusiness = async (businessId: string): Promise<ApiResponse<InstagramCampaign[]>> => {
  try {
    const { data, error } = await supabase
      .from('instagram_campaigns')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const createInstagramCampaign = async (
  campaign: Omit<InstagramCampaign, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<InstagramCampaign>> => {
  try {
    const { data, error } = await supabase
      .from('instagram_campaigns')
      .insert([campaign])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Dashboard analytics functions
export const fetchDashboardStats = async (): Promise<ApiResponse<{
  totalResponses: number;
  totalCampaigns: number;
  totalBusinesses: number;
  recentActivities: any[];
}>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };
    
    // Get user's businesses
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id);
    
    const businessIds = businesses?.map(b => b.id) || [];
    
    if (businessIds.length === 0) {
      return { success: true, data: { totalResponses: 0, totalCampaigns: 0, totalBusinesses: 0, recentActivities: [] } };
    }
    
    // Get survey responses count
    const { count: responsesCount } = await supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .in('survey_id', businessIds);
    
    // Get campaigns count
    const { count: campaignsCount } = await supabase
      .from('instagram_campaigns')
      .select('*', { count: 'exact', head: true })
      .in('business_id', businessIds);
    
    return { 
      success: true, 
      data: {
        totalResponses: responsesCount || 0,
        totalCampaigns: campaignsCount || 0,
        totalBusinesses: businessIds.length,
        recentActivities: [] // Can be expanded later
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
