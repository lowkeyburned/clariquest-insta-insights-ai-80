
import { supabase } from '@/integrations/supabase/client';
import { SurveyQuestion, SurveyData } from './sampleSurveyData';

// Business functions
export const fetchBusinesses = async () => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*');
  
  if (error) throw error;
  return data || [];
};

export const fetchBusinessById = async (id: string) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createBusiness = async (businessData: any) => {
  const { data, error } = await supabase
    .from('businesses')
    .insert([businessData])
    .select();
  
  if (error) throw error;
  return data ? data[0] : null;
};

export const updateBusiness = async (id: string, businessData: any) => {
  const { data, error } = await supabase
    .from('businesses')
    .update(businessData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data ? data[0] : null;
};

export const deleteBusiness = async (id: string) => {
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Survey functions
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
  
  if (surveyError || !newSurvey) throw surveyError;
  
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

// Survey response functions
export const saveSurveyResponse = async (surveyId: string, answers: Record<number, string | number>) => {
  // Create survey response record
  const { data: responseData, error: responseError } = await supabase
    .from('survey_responses')
    .insert([{
      survey_id: surveyId,
      completed: true
    }])
    .select();
  
  if (responseError || !responseData) throw responseError;
  
  const responseId = responseData[0].id;
  
  // Convert answers to array of answer records
  const answerRecords = Object.entries(answers).map(([questionId, answer]) => ({
    survey_response_id: responseId,
    question_id: questionId,
    answer_value: typeof answer === 'string' ? { value: answer } : { value: answer.toString() }
  }));
  
  // Insert all answers
  const { error: answersError } = await supabase
    .from('response_answers')
    .insert(answerRecords);
  
  if (answersError) throw answersError;
  
  return responseData[0];
};

export const fetchSurveyResponses = async (surveyId: string) => {
  // Fetch all responses for a survey
  const { data: responses, error: responsesError } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('survey_id', surveyId);
  
  if (responsesError) throw responsesError;
  
  // Fetch all answers for these responses
  const responseIds = responses.map(r => r.id);
  
  if (responseIds.length === 0) {
    return [];
  }
  
  const { data: answers, error: answersError } = await supabase
    .from('response_answers')
    .select('*, survey_response_id')
    .in('survey_response_id', responseIds);
  
  if (answersError) throw answersError;
  
  // Group answers by response
  const responseAnswers = responses.map(response => {
    const responseAnswers = answers.filter(answer => answer.survey_response_id === response.id);
    
    return {
      ...response,
      answers: responseAnswers.map(answer => ({
        questionId: answer.question_id,
        value: answer.answer_value && typeof answer.answer_value === 'object' ? 
          (answer.answer_value as any).value || "" : ""
      }))
    };
  });
  
  return responseAnswers;
};

// Instagram campaign functions
export const fetchCampaigns = async (businessId?: string) => {
  let query = supabase
    .from('instagram_campaigns')
    .select('*, businesses(name)');
  
  if (businessId) {
    query = query.eq('business_id', businessId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

export const fetchCampaignById = async (id: string) => {
  const { data, error } = await supabase
    .from('instagram_campaigns')
    .select('*, businesses(name)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createCampaign = async (campaignData: any) => {
  const { data, error } = await supabase
    .from('instagram_campaigns')
    .insert([campaignData])
    .select();
  
  if (error) throw error;
  return data ? data[0] : null;
};

export const updateCampaign = async (id: string, campaignData: any) => {
  const { data, error } = await supabase
    .from('instagram_campaigns')
    .update(campaignData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data ? data[0] : null;
};

export const deleteCampaign = async (id: string) => {
  const { error } = await supabase
    .from('instagram_campaigns')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// App settings functions
export const getSetting = async (key: string) => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  
  if (error) throw error;
  return data?.value;
};

export const saveSetting = async (key: string, value: string) => {
  // First try to update
  const { data, error } = await supabase
    .from('settings')
    .update({ value })
    .eq('key', key)
    .select();
  
  // If no rows affected, insert instead
  if ((data && data.length === 0) || error) {
    const { data: insertData, error: insertError } = await supabase
      .from('settings')
      .insert([{ key, value }])
      .select();
    
    if (insertError) throw insertError;
    return insertData ? insertData[0] : null;
  }
  
  return data ? data[0] : null;
};
