
import { BusinessWithSurveyCount } from '@/components/business/BusinessForm';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { SurveyQuestion } from '@/utils/sampleSurveyData';
import { toast } from 'sonner';

// Default webhook URL - this can be overridden
export const DEFAULT_WEBHOOK_URL = 'http://localhost:5678/webhook-test/ab4a8a3c-0b5a-4728-9983-25caff5d1b9c';

/**
 * Fetches an AI response from the webhook
 * @param userMessage The message from the user
 * @param business The business data
 * @param customWebhookUrl Optional custom webhook URL to use instead of the default
 */
export const fetchAIResponse = async (
  userMessage: string, 
  business: BusinessWithSurveyCount,
  customWebhookUrl?: string
): Promise<{ message: string; isSurveyRelated: boolean }> => {
  const webhookUrl = customWebhookUrl || DEFAULT_WEBHOOK_URL;
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        businessName: business.name,
        businessId: business.id,
        businessDescription: business.description || '',
        sessionId: uuidv4() // Add a unique session ID for tracking this conversation
      })
    });
    
    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return parseWebhookResponse(data);
    
  } catch (error) {
    console.error("Error fetching AI response from webhook:", error);
    throw error;
  }
};

/**
 * Parses the response from the webhook to extract the AI message and survey indicators
 * @param data The response data from the webhook
 */
const parseWebhookResponse = (data: any): { message: string; isSurveyRelated: boolean } => {
  console.log("Webhook response:", data);
  
  if (typeof data !== 'object') {
    throw new Error("Failed to parse response from webhook");
  }
  
  // Extract the main message
  let message = '';
  if (data?.message) {
    message = data.message;
  } else if (data?.response) {
    message = data.response;
  } else if (typeof data === 'string') {
    message = data;
  } else if (typeof data === 'object' && Object.keys(data).length > 0) {
    // Try to find any string property in the response that might contain our message
    const firstStringProp = Object.values(data).find(val => typeof val === 'string');
    if (firstStringProp) {
      message = firstStringProp as string;
    } else {
      throw new Error("Invalid response format from webhook");
    }
  } else {
    throw new Error("Invalid response format from webhook");
  }
  
  // Check if the response is survey related (either from the flag or by detecting keywords)
  const isSurveyRelated = 
    data?.isSurveyRelated === true || 
    message.toLowerCase().includes('survey') ||
    message.toLowerCase().includes('questionnaire') ||
    message.toLowerCase().includes('collect feedback');
  
  return { 
    message, 
    isSurveyRelated 
  };
};

/**
 * Creates a survey from AI chat content
 * @param combinedData The AI message content with survey suggestions and business ID combined
 */
export const createSurveyFromChat = async (combinedData: string): Promise<string> => {
  try {
    // Split the combined data to extract content and businessId
    const [content, businessId] = combinedData.split(":::");
    
    if (!businessId) {
      throw new Error("Missing business ID for survey creation");
    }
    
    console.log("Creating survey from chat for business:", businessId);
    console.log("Survey content:", content);
    
    // Extract potential questions from the content
    const questions = extractQuestionsFromContent(content);
    
    if (questions.length === 0) {
      throw new Error("No valid survey questions could be extracted from the content");
    }
    
    // Prepare survey data
    const surveyTitle = extractSurveyTitle(content) || "AI-Generated Survey";
    const surveyDescription = "Survey generated from AI insights chat";
    
    // Format survey questions for database insertion
    const formattedQuestions = questions.map((q, index) => ({
      text: q,
      type: "multiple_choice",
      options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]
    }));

    try {
      // Create the survey in the database
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .insert({
          title: surveyTitle,
          description: surveyDescription,
          business_id: businessId,
        })
        .select()
        .single();

      if (surveyError) {
        throw surveyError;
      }

      // Get the newly created survey ID
      const surveyId = surveyData.id;

      // Prepare questions with survey_id for database insertion
      const questionsToInsert = formattedQuestions.map((q, index) => ({
        survey_id: surveyId,
        question_text: q.text,
        question_type: q.type,
        required: true,
        order_index: index,
        options: { options: q.options }
      }));

      // Insert questions
      const { error: questionsError } = await supabase
        .from('survey_questions')
        .insert(questionsToInsert);

      if (questionsError) {
        throw questionsError;
      }

      return surveyId;
    } catch (dbError) {
      console.error("Database error creating survey:", dbError);
      throw new Error(`Failed to create survey in database: ${(dbError as Error).message}`);
    }
  } catch (error) {
    console.error("Error creating survey from chat:", error);
    throw new Error("Failed to create survey: " + (error as Error).message);
  }
};

// Helper functions for extracting information from AI content
const extractQuestionsFromContent = (content: string): string[] => {
  const questions: string[] = [];
  
  // Look for numbered lists (e.g., "1. How satisfied are you...")
  const numberedQuestions = content.match(/\d+\.\s+(.*?)(?=\d+\.|$)/gs);
  if (numberedQuestions) {
    numberedQuestions.forEach(q => {
      // Clean up the question and remove the number
      const cleaned = q.replace(/^\d+\.\s+/, '').trim();
      if (cleaned) questions.push(cleaned);
    });
  }
  
  // Look for bullet points
  const bulletQuestions = content.match(/[•\-\*]\s+(.*?)(?=[•\-\*]|$)/gs);
  if (bulletQuestions) {
    bulletQuestions.forEach(q => {
      // Clean up the question and remove the bullet
      const cleaned = q.replace(/^[•\-\*]\s+/, '').trim();
      if (cleaned) questions.push(cleaned);
    });
  }
  
  // If no questions were found, try to extract sentences ending with question marks
  if (questions.length === 0) {
    const questionSentences = content.match(/[^.!?]+\?/g);
    if (questionSentences) {
      questionSentences.forEach(q => {
        const cleaned = q.trim();
        if (cleaned) questions.push(cleaned);
      });
    }
  }
  
  return questions;
};

const extractSurveyTitle = (content: string): string | null => {
  // Look for phrases like "Survey on..." or "... survey"
  const titleMatch = content.match(/Survey on\s+(.*?)(?=\.|$)/i) || 
                    content.match(/(.*?)\s+survey(?=\.|$)/i);
  
  if (titleMatch && titleMatch[1]) {
    return `${titleMatch[1]} Survey`;
  }
  
  return null;
};
