
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
    const formattedQuestions = questions.map(q => {
      // Determine if this looks like a Likert scale question
      const isLikertQuestion = 
        q.toLowerCase().includes('satisfied') || 
        q.toLowerCase().includes('agree') || 
        q.toLowerCase().includes('rate') || 
        q.toLowerCase().includes('how likely') ||
        q.toLowerCase().includes('how would you') ||
        q.toLowerCase().includes('important');
      
      return {
        text: q,
        type: isLikertQuestion ? "likert" : "multiple_choice",
        options: isLikertQuestion 
          ? ["a) Extremely important", "b) Very important", "c) Somewhat important", "d) Not very important", "e) Not important"]
          : ["Yes", "No", "Maybe", "Other"]
      };
    });

    // Begin transaction with the Supabase client
    try {
      // Step 1: Create the survey record first
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .insert({
          title: surveyTitle,
          description: surveyDescription,
          business_id: businessId,
          is_active: true
        })
        .select()
        .single();

      if (surveyError) {
        console.error("Survey creation error:", surveyError);
        throw new Error(`Failed to create survey: ${surveyError.message}`);
      }

      if (!surveyData || !surveyData.id) {
        throw new Error("Failed to get survey ID after creation");
      }

      // Get the newly created survey ID
      const surveyId = surveyData.id;
      console.log("Created survey with ID:", surveyId);

      // Step 2: Insert questions as the currently authenticated user
      // This should respect RLS policies
      const questionsToInsert = formattedQuestions.map((q, index) => ({
        survey_id: surveyId,
        question_text: q.text,
        question_type: q.type,
        required: true,
        order_index: index,
        options: { options: q.options }
      }));

      console.log("Inserting questions:", questionsToInsert);

      const { data: questionData, error: questionsError } = await supabase
        .from('survey_questions')
        .insert(questionsToInsert)
        .select();

      if (questionsError) {
        console.error("Question insertion error:", questionsError);
        
        // Since question insertion failed, we should clean up by removing the survey
        await supabase
          .from('surveys')
          .delete()
          .eq('id', surveyId);
          
        throw new Error(`Failed to create survey questions: ${questionsError.message}`);
      }

      console.log("Successfully created survey and questions");
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
export const extractQuestionsFromContent = (content: string): string[] => {
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

  // If we still don't have any questions, try to split by new lines
  if (questions.length === 0) {
    const lines = content.split('\n');
    lines.forEach(line => {
      const cleaned = line.trim();
      if (cleaned && cleaned.length > 10 && !cleaned.startsWith('#') && !cleaned.startsWith('Thank you')) {
        questions.push(cleaned);
      }
    });
  }
  
  return questions;
};

export const extractSurveyTitle = (content: string): string | null => {
  // Look for phrases like "Survey on..." or "... survey"
  const titleMatch = content.match(/Survey on\s+(.*?)(?=\.|$)/i) || 
                    content.match(/(.*?)\s+survey(?=\.|$)/i);
  
  if (titleMatch && titleMatch[1]) {
    return `${titleMatch[1]} Survey`;
  }

  // Try to extract a title from the first line if it doesn't contain typical question words
  const lines = content.split('\n');
  if (lines && lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine && 
        !firstLine.toLowerCase().includes('how') && 
        !firstLine.toLowerCase().includes('what') && 
        !firstLine.toLowerCase().includes('why') && 
        !firstLine.toLowerCase().includes('when') &&
        !firstLine.toLowerCase().includes('where')) {
      return firstLine.endsWith('Survey') ? firstLine : `${firstLine} Survey`;
    }
  }
  
  // If we can detect a business theme or topic in the content, use that
  const topics = ['boba', 'coffee', 'tea', 'food', 'restaurant', 'shopping', 'service'];
  for (const topic of topics) {
    if (content.toLowerCase().includes(topic)) {
      return `${topic.charAt(0).toUpperCase() + topic.slice(1)} Preferences Survey`;
    }
  }

  return "Customer Feedback Survey";
};
