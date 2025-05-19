
import { supabase } from '@/integrations/supabase/client';
import { SurveyQuestion, SurveyData } from '../sampleSurveyData';

/**
 * Survey management functions
 */

export const fetchSurveys = async (businessId?: string) => {
  let query = supabase
    .from('surveys')
    .select('*, businesses(name)');
  
  if (businessId) {
    query = query.eq('business_id', businessId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

export const fetchSurveyById = async (id: string) => {
  // First fetch the survey basic info
  const { data: surveyData, error: surveyError } = await supabase
    .from('surveys')
    .select('*, businesses(name)')
    .eq('id', id)
    .single();
  
  if (surveyError) throw surveyError;
  
  // Then fetch the questions
  const { data: questionsData, error: questionsError } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('survey_id', id)
    .order('order_index', { ascending: true });
  
  if (questionsError) throw questionsError;
  
  // Transform the questions to match the SurveyQuestion type
  const questions: SurveyQuestion[] = questionsData.map((q: any) => {
    const question: SurveyQuestion = {
      id: q.id,
      text: q.question_text,
      type: q.question_type,
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
  
  return survey;
};

export const fetchSurveyBySlug = async (slug: string) => {
  // First fetch the survey basic info by slug
  const { data: surveyData, error: surveyError } = await supabase
    .from('surveys')
    .select('*, businesses(name)')
    .eq('slug', slug)
    .single();
  
  if (surveyError) throw surveyError;
  
  // Then fetch the questions using the survey id
  const { data: questionsData, error: questionsError } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('survey_id', surveyData.id)
    .order('order_index', { ascending: true });
  
  if (questionsError) throw questionsError;
  
  // Transform the questions to match the SurveyQuestion type
  const questions: SurveyQuestion[] = questionsData.map((q: any) => {
    const question: SurveyQuestion = {
      id: q.id,
      text: q.question_text,
      type: q.question_type,
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
  
  return survey;
};

export const createSurvey = async (surveyData: { title: string; description: string; businessId: string }, questions: SurveyQuestion[]) => {
  // Start a transaction
  const { data: newSurvey, error: surveyError } = await supabase
    .from('surveys')
    .insert([{
      title: surveyData.title,
      description: surveyData.description,
      business_id: surveyData.businessId
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
      question_text: q.text,
      question_type: q.type,
      required: true,
      order_index: index
    };
    
    // Add options as JSONB
    if (q.type === 'multiple_choice' && q.options) {
      questionData.options = { options: q.options };
    }
    
    if (q.type === 'slider') {
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
};

export const updateSurvey = async (id: string, surveyData: any, questions: SurveyQuestion[]) => {
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
      question_text: q.text,
      question_type: q.type,
      required: true,
      order_index: index
    };
    
    // Add options as JSONB
    if (q.type === 'multiple_choice' && q.options) {
      questionData.options = { options: q.options };
    }
    
    if (q.type === 'slider') {
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
};

export const deleteSurvey = async (id: string) => {
  const { error } = await supabase
    .from('surveys')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};
