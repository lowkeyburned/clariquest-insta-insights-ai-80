import { supabase } from '@/integrations/supabase/client';
import { SurveyQuestion, Survey } from '../sampleSurveyData';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * Survey management functions with comprehensive error handling
 */

export const fetchSurveys = async (businessId?: string) => {
  return wrapSupabaseOperation(async () => {
    let query = supabase
      .from('surveys')
      .select(`
        id,
        title,
        description,
        slug,
        business_id,
        created_by,
        is_active,
        created_at,
        updated_at
      `);
    
    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }, businessId ? `Fetching surveys for business ${businessId}` : 'Fetching all surveys');
};

export const fetchSurveyById = async (id: string) => {
  if (!id) {
    throw new Error('Survey ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    console.log('Fetching survey by ID:', id);
    
    // First fetch the survey basic info
    const { data: surveyData, error: surveyError } = await supabase
      .from('surveys')
      .select(`
        id,
        title,
        description,
        slug,
        business_id,
        created_by,
        is_active,
        webhook_url,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (surveyError) {
      console.error('Survey fetch error:', surveyError);
      throw new Error('Failed to load survey');
    }
    
    if (!surveyData) {
      throw new Error('Survey not found');
    }
    
    console.log('Survey data loaded:', surveyData);
    
    // Then fetch the questions separately
    const { data: questionsData, error: questionsError } = await supabase
      .from('survey_questions')
      .select(`
        id,
        survey_id,
        question_text,
        question_type,
        options,
        required,
        order_index,
        created_at,
        updated_at
      `)
      .eq('survey_id', id)
      .order('order_index', { ascending: true });
    
    if (questionsError) {
      console.error('Error fetching survey questions:', questionsError);
      // Don't throw error for questions, just log it
    }
    
    console.log('Questions data loaded:', questionsData);
    
    // Transform the questions to match the SurveyQuestion type with better formatting
    const questions: SurveyQuestion[] = (questionsData || []).map((q: any) => {
      const question: SurveyQuestion = {
        id: q.id,
        question_text: cleanQuestionText(q.question_text),
        question_type: q.question_type,
        order_index: q.order_index || 0
      };
      
      // Handle JSON data with type checking
      if (typeof q.options === 'object' && q.options !== null) {
        // For multiple_choice questions
        if (q.options.options && Array.isArray(q.options.options)) {
          question.options = q.options.options.filter(opt => opt && typeof opt === 'string');
        }
        
        // For slider questions
        if (q.options.min !== undefined) {
          question.min = parseInt(q.options.min.toString());
        }
        
        if (q.options.max !== undefined) {
          question.max = parseInt(q.options.max.toString());
        }
      }
      
      return question;
    });
    
    // Combine survey data with questions
    const survey = {
      ...surveyData,
      questions
    };
    
    console.log('Final survey object:', survey);
    return survey;
  }, `Fetching survey ${id}`);
};

// Helper function to clean question text
const cleanQuestionText = (text: string): string => {
  if (!text) return '';
  
  let cleaned = text;
  
  // Remove excessive asterisks and markdown
  cleaned = cleaned.replace(/\*+/g, '');
  
  // Remove numbered prefixes (like "1. ", "2. ", etc.)
  cleaned = cleaned.replace(/^\d+\.\s*/, '');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Ensure proper capitalization
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  
  // Add question mark if missing and it's a question
  if (!cleaned.endsWith('?') && !cleaned.endsWith('.') && !cleaned.endsWith(':')) {
    if (cleaned.toLowerCase().includes('how') || 
        cleaned.toLowerCase().includes('what') || 
        cleaned.toLowerCase().includes('why') || 
        cleaned.toLowerCase().includes('when') || 
        cleaned.toLowerCase().includes('where') ||
        cleaned.toLowerCase().includes('do you') ||
        cleaned.toLowerCase().includes('would you') ||
        cleaned.toLowerCase().includes('are you')) {
      cleaned += '?';
    }
  }
  
  return cleaned.trim();
};

export const fetchSurveyBySlug = async (slug: string) => {
  if (!slug) {
    throw new Error('Survey slug is required');
  }
  
  return wrapSupabaseOperation(async () => {
    console.log('Fetching survey by slug:', slug);
    
    // First fetch the survey basic info by slug
    const { data: surveyData, error: surveyError } = await supabase
      .from('surveys')
      .select(`
        id,
        title,
        description,
        slug,
        business_id,
        created_by,
        is_active,
        webhook_url,
        created_at,
        updated_at
      `)
      .eq('slug', slug)
      .maybeSingle();
    
    if (surveyError) {
      console.error('Survey fetch error:', surveyError);
      throw new Error('Failed to load survey');
    }
    
    if (!surveyData) {
      throw new Error('Survey not found');
    }
    
    console.log('Survey data loaded by slug:', surveyData);
    
    // Then fetch the questions using the survey id
    const { data: questionsData, error: questionsError } = await supabase
      .from('survey_questions')
      .select(`
        id,
        survey_id,
        question_text,
        question_type,
        options,
        required,
        order_index,
        created_at,
        updated_at
      `)
      .eq('survey_id', surveyData.id)
      .order('order_index', { ascending: true });
    
    if (questionsError) {
      console.error('Error fetching survey questions:', questionsError);
      // Don't throw error for questions, just log it
    }
    
    console.log('Questions data loaded by slug:', questionsData);
    
    // Transform the questions to match the SurveyQuestion type
    const questions: SurveyQuestion[] = (questionsData || []).map((q: any) => {
      const question: SurveyQuestion = {
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
      };
      
      // Handle JSON data with type checking
      if (typeof q.options === 'object' && q.options !== null) {
        // For multiple_choice questions
        if (q.options.options) {
          question.options = q.options.options;
        }
        
        // For slider questions
        if (q.options.min !== undefined) {
          question.min = parseInt(q.options.min.toString());
        }
        
        if (q.options.max !== undefined) {
          question.max = parseInt(q.options.max.toString());
        }
      }
      
      return question;
    });
    
    // Combine survey data with questions
    const survey = {
      ...surveyData,
      questions
    };
    
    console.log('Final survey object by slug:', survey);
    return survey;
  }, `Fetching survey by slug ${slug}`);
};

export const createSurvey = async (surveyData: { title: string; description: string; businessId: string }, questions: SurveyQuestion[]) => {
  if (!surveyData?.title?.trim()) {
    throw new Error('Survey title is required');
  }
  
  if (!surveyData?.businessId) {
    throw new Error('Business ID is required');
  }
  
  if (!questions || questions.length === 0) {
    throw new Error('At least one question is required');
  }
  
  return wrapSupabaseOperation(async () => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Start a transaction
    const { data: newSurvey, error: surveyError } = await supabase
      .from('surveys')
      .insert([{
        title: surveyData.title,
        description: surveyData.description,
        business_id: surveyData.businessId,
        created_by: user.id
      }])
      .select();
    
    if (surveyError) {
      console.error("Survey creation error:", surveyError);
      throw new Error(`Failed to create survey: ${surveyError.message}`);
    }
    
    if (!newSurvey || newSurvey.length === 0) {
      throw new Error('Survey was created but no data was returned');
    }
    
    const surveyId = newSurvey[0].id;
    
    // Prepare questions with survey_id
    const questionsToInsert = questions.map((q, index) => {
      const questionData: any = {
        survey_id: surveyId,
        question_text: q.question_text,
        question_type: q.question_type,
        required: true,
        order_index: index
      };
      
      // Add options as JSONB
      if (q.question_type === 'multiple_choice' && q.options) {
        questionData.options = { options: q.options };
      }
      
      if (q.question_type === 'slider') {
        questionData.options = {
          min: q.min !== undefined ? q.min.toString() : '0',
          max: q.max !== undefined ? q.max.toString() : '10'
        };
      }
      
      return questionData;
    });
    
    // Insert all questions
    const { error: questionsError } = await supabase
      .from('survey_questions')
      .insert(questionsToInsert);
    
    if (questionsError) {
      console.error("Question creation error:", questionsError);
      throw new Error(`Failed to create survey questions: ${questionsError.message}`);
    }
    
    return { ...newSurvey[0], questions };
  }, 'Creating survey', 'Survey created successfully!');
};

export const updateSurvey = async (id: string, surveyData: any, questions: SurveyQuestion[]) => {
  if (!id) {
    throw new Error('Survey ID is required');
  }
  
  if (!surveyData?.title?.trim()) {
    throw new Error('Survey title is required');
  }
  
  return wrapSupabaseOperation(async () => {
    // Update survey basic info
    const { error: surveyError } = await supabase
      .from('surveys')
      .update({
        title: surveyData.title,
        description: surveyData.description,
      })
      .eq('id', id);
    
    if (surveyError) throw surveyError;
    
    // Delete existing questions
    const { error: deleteError } = await supabase
      .from('survey_questions')
      .delete()
      .eq('survey_id', id);
    
    if (deleteError) throw deleteError;
    
    // Prepare questions with survey_id
    const questionsToInsert = questions.map((q, index) => {
      const questionData: any = {
        survey_id: id,
        question_text: q.question_text,
        question_type: q.question_type,
        required: true,
        order_index: index
      };
      
      // Add options as JSONB
      if (q.question_type === 'multiple_choice' && q.options) {
        questionData.options = { options: q.options };
      }
      
      if (q.question_type === 'slider') {
        questionData.options = {
          min: q.min?.toString(),
          max: q.max?.toString()
        };
      }
      
      return questionData;
    });
    
    // Insert all questions
    const { error: questionsError } = await supabase
      .from('survey_questions')
      .insert(questionsToInsert);
    
    if (questionsError) throw questionsError;
    
    return true;
  }, `Updating survey ${id}`, 'Survey updated successfully!');
};

export const deleteSurvey = async (id: string) => {
  if (!id) {
    throw new Error('Survey ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }, `Deleting survey ${id}`, 'Survey deleted successfully!');
};

export const updateSurveyWebhook = async (surveyId: string, webhookUrl: string) => {
  if (!surveyId) {
    throw new Error('Survey ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('surveys')
      .update({ webhook_url: webhookUrl })
      .eq('id', surveyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }, `Updating webhook for survey ${surveyId}`, 'Survey webhook updated successfully!');
};
