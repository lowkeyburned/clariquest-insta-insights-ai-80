
import { supabase } from "@/integrations/supabase/client";
import { SurveyData, SurveyQuestion } from "./sampleSurveyData";
import { SurveyResponse } from "./surveyResponseUtils";
import { toast } from "@/components/ui/use-toast";

// Business operations
export const fetchBusinesses = async () => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching businesses:', error);
    toast({
      title: "Error fetching businesses",
      description: error.message,
      variant: "destructive"
    });
    return [];
  }
  
  return data;
};

export const fetchBusinessById = async (id: string) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching business with ID ${id}:`, error);
    toast({
      title: "Error fetching business",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
  
  return data;
};

// Survey operations
export const fetchSurveys = async (businessId?: string) => {
  let query = supabase
    .from('surveys')
    .select('*');
  
  if (businessId) {
    query = query.eq('business_id', businessId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching surveys:', error);
    toast({
      title: "Error fetching surveys",
      description: error.message,
      variant: "destructive"
    });
    return [];
  }
  
  return data;
};

export const fetchSurveyById = async (id: string) => {
  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (surveyError) {
    console.error(`Error fetching survey with ID ${id}:`, surveyError);
    toast({
      title: "Error fetching survey",
      description: surveyError.message,
      variant: "destructive"
    });
    return null;
  }

  if (!survey) return null;

  // Fetch questions for this survey
  const { data: questions, error: questionsError } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('survey_id', id)
    .order('order_index', { ascending: true });

  if (questionsError) {
    console.error(`Error fetching questions for survey ${id}:`, questionsError);
    toast({
      title: "Error fetching survey questions",
      description: questionsError.message,
      variant: "destructive"
    });
    return null;
  }

  // Format as SurveyData object for compatibility with existing components
  const formattedQuestions = questions.map(q => ({
    id: parseInt(q.order_index),
    type: q.question_type as "multiple_choice" | "open_ended" | "slider",
    text: q.question_text,
    options: q.options?.options,
    min: q.options?.min,
    max: q.options?.max
  }));

  return {
    id: survey.id,
    businessName: "Loading...", // This could be fetched separately if needed
    title: survey.title,
    description: survey.description || "",
    questions: formattedQuestions,
    createdAt: survey.created_at
  };
};

// Survey response operations
export const saveSurveyResponse = async (surveyId: string, answers: Record<number, string | number>) => {
  // First, create a survey response record
  const { data: responseData, error: responseError } = await supabase
    .from('survey_responses')
    .insert({
      survey_id: surveyId,
      completed: true
    })
    .select()
    .maybeSingle();

  if (responseError) {
    console.error('Error saving survey response:', responseError);
    toast({
      title: "Error saving response",
      description: responseError.message,
      variant: "destructive"
    });
    return null;
  }

  if (!responseData) return null;
  
  // Then create answer records for each question
  const answerPromises = Object.entries(answers).map(async ([questionIndex, answer]) => {
    // Get the actual question_id from the index
    const { data: questionData } = await supabase
      .from('survey_questions')
      .select('id')
      .eq('survey_id', surveyId)
      .eq('order_index', parseInt(questionIndex))
      .maybeSingle();

    if (!questionData) return null;

    // Save the answer
    return supabase
      .from('response_answers')
      .insert({
        survey_response_id: responseData.id,
        question_id: questionData.id,
        answer_text: typeof answer === 'string' ? answer : answer.toString(),
        answer_value: typeof answer === 'number' ? { value: answer } : null
      });
  });

  await Promise.all(answerPromises);
  return responseData.id;
};

export const getSurveyResponses = async (surveyId: string) => {
  const { data: responses, error: responsesError } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('survey_id', surveyId);

  if (responsesError) {
    console.error(`Error fetching responses for survey ${surveyId}:`, responsesError);
    toast({
      title: "Error fetching survey responses",
      description: responsesError.message,
      variant: "destructive"
    });
    return [];
  }

  // For each response, fetch the answers
  const formattedResponses = await Promise.all(responses.map(async (response) => {
    const { data: answers, error: answersError } = await supabase
      .from('response_answers')
      .select(`
        *,
        survey_questions (question_text, order_index)
      `)
      .eq('survey_response_id', response.id);

    if (answersError) {
      console.error(`Error fetching answers for response ${response.id}:`, answersError);
      return null;
    }

    // Format the answers into the expected structure
    const formattedAnswers: Record<number, string | number> = {};
    answers.forEach(answer => {
      const orderIndex = answer.survey_questions.order_index;
      formattedAnswers[orderIndex] = answer.answer_value?.value !== undefined 
        ? answer.answer_value.value 
        : answer.answer_text;
    });

    return {
      id: response.id,
      surveyId,
      answers: formattedAnswers,
      submittedAt: response.created_at
    };
  }));

  return formattedResponses.filter(Boolean) as SurveyResponse[];
};

// Instagram campaign operations
export const saveInstagramCampaign = async (campaignData: {
  businessId: string;
  name: string;
  messageText: string;
  location?: string;
  reachNumbers?: number;
}) => {
  const { data, error } = await supabase
    .from('instagram_campaigns')
    .insert({
      business_id: campaignData.businessId,
      name: campaignData.name,
      message_text: campaignData.messageText,
      location: campaignData.location || null,
      reach_numbers: campaignData.reachNumbers || null,
      status: 'draft'
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving Instagram campaign:', error);
    toast({
      title: "Error saving campaign",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }

  return data;
};

// Settings operations
export const saveSettings = async (key: string, value: string, description?: string) => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('key', key)
    .maybeSingle();

  let result;

  if (data) {
    // Update existing setting
    result = await supabase
      .from('settings')
      .update({ value, description })
      .eq('key', key)
      .select()
      .maybeSingle();
  } else {
    // Insert new setting
    result = await supabase
      .from('settings')
      .insert({ key, value, description })
      .select()
      .maybeSingle();
  }

  if (result.error) {
    console.error(`Error saving setting ${key}:`, result.error);
    toast({
      title: "Error saving setting",
      description: result.error.message,
      variant: "destructive"
    });
    return null;
  }

  return result.data;
};

export const getSetting = async (key: string) => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return null;
  }

  return data?.value;
};
