
import { BusinessWithSurveyCount } from '@/components/business/BusinessForm';
import { v4 as uuidv4 } from 'uuid';

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
 * @param content The AI message content with survey suggestions
 * @param businessId The business ID to associate with the survey
 */
export const createSurveyFromChat = async (
  content: string,
  businessId: string
): Promise<string> => {
  try {
    console.log("Creating survey from chat for business:", businessId);
    console.log("Survey content:", content);
    
    // Extract potential questions from the AI response
    const questions = extractQuestionsFromContent(content);
    
    // Prepare survey data
    const surveyTitle = extractSurveyTitle(content) || "AI-Generated Survey";
    const surveyDescription = "Survey generated from AI insights chat";
    
    // Format data for webhook call to create survey
    const webhookPayload = {
      survey_title: surveyTitle,
      business_id: businessId,
      description: surveyDescription,
      questions: questions.map((q, index) => ({
        text: q,
        type: "multiple_choice",
        options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]
      }))
    };
    
    // Here we could send this to an n8n webhook, but for now we'll just return a success message
    // In a real implementation, you would make a POST request to your survey creation webhook
    
    // For now, return the payload that would be sent to the webhook
    return JSON.stringify(webhookPayload);
    
  } catch (error) {
    console.error("Error creating survey from chat:", error);
    throw new Error("Failed to create survey: " + (error as Error).message);
  }
};

/**
 * Extract potential questions from AI chat content
 * @param content AI chat content 
 */
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

/**
 * Extract a potential survey title from content
 * @param content AI chat content
 */
const extractSurveyTitle = (content: string): string | null => {
  // Look for phrases like "Survey on..." or "... survey"
  const titleMatch = content.match(/Survey on\s+(.*?)(?=\.|$)/i) || 
                    content.match(/(.*?)\s+survey(?=\.|$)/i);
  
  if (titleMatch && titleMatch[1]) {
    return `${titleMatch[1]} Survey`;
  }
  
  return null;
};
