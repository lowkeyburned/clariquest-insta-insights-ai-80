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
export const createSurveyFromChat = async (combinedData: string): Promise<{ surveyId: string; shareableLink: string }> => {
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
    
    // Format survey questions for database insertion with improved parsing
    const formattedQuestions = questions.map((q, index) => {
      return {
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options && q.options.length > 0 ? q.options : null,
        required: true,
        order_index: index
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

      // Step 2: Insert questions
      const questionsToInsert = formattedQuestions.map((q) => ({
        survey_id: surveyId,
        question_text: q.question_text,
        question_type: q.question_type,
        required: q.required,
        order_index: q.order_index,
        options: q.options ? { options: q.options } : null
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

      // Generate shareable link
      const shareableLink = `${window.location.origin}/survey/${surveyId}`;

      console.log("Successfully created survey and questions");
      return { surveyId, shareableLink };
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
export const extractQuestionsFromContent = (content: string): { question_text: string; question_type: string; options?: string[] }[] => {
  const questions: { question_text: string; question_type: string; options?: string[] }[] = [];
  
  // Clean the content and split into lines
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  let currentQuestion: { question_text: string; question_type: string; options?: string[] } | null = null;
  let currentOptions: string[] = [];
  
  for (const line of lines) {
    // Match numbered questions (e.g., "1. **How frequently do you...")
    const questionMatch = line.match(/^(\d+)\.\s+\*\*(.*?)\*\*\s*$/);
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion) {
        currentQuestion.options = currentOptions.length > 0 ? currentOptions : undefined;
        questions.push(currentQuestion);
        currentOptions = [];
      }
      
      // Create new question
      const questionText = questionMatch[2].trim();
      
      // Determine question type based on question number and content
      let questionType = 'multiple_choice';
      if (questionText.toLowerCase().includes('open-ended') || 
          questionText.toLowerCase().includes('additional thoughts') ||
          questionText.toLowerCase().includes('share any')) {
        questionType = 'text';
      }
      
      currentQuestion = {
        question_text: questionText,
        question_type: questionType
      };
      continue;
    }
    
    // Match options (e.g., "   - a) Daily" or "   - b) Weekly")
    const optionMatch = line.match(/^\s*-\s*[a-z]\)\s*(.*?)\s*$/);
    if (optionMatch && currentQuestion) {
      const optionText = optionMatch[1].trim();
      currentOptions.push(optionText);
      continue;
    }
    
    // If we have a current question and encounter a non-option line, finalize the question
    if (currentQuestion && line && !line.startsWith('-') && !line.match(/^\d+\./)) {
      // Check if this is an open-ended question indicator
      if (line.toLowerCase().includes('open-ended') || line.toLowerCase().includes('open ended')) {
        currentQuestion.question_type = 'text';
      }
      
      // Finalize current question
      currentQuestion.options = currentOptions.length > 0 ? currentOptions : undefined;
      if (currentOptions.length > 0) {
        currentQuestion.question_type = determineQuestionType(currentQuestion.question_text, currentOptions);
      }
      questions.push(currentQuestion);
      currentQuestion = null;
      currentOptions = [];
    }
  }
  
  // Don't forget the last question
  if (currentQuestion) {
    currentQuestion.options = currentOptions.length > 0 ? currentOptions : undefined;
    if (currentOptions.length > 0) {
      currentQuestion.question_type = determineQuestionType(currentQuestion.question_text, currentOptions);
    }
    questions.push(currentQuestion);
  }
  
  console.log("Extracted questions:", questions);
  return questions;
};

// Helper function to determine question type based on text and options
const determineQuestionType = (questionText: string, options: string[]): string => {
  const lowercaseQuestion = questionText.toLowerCase();
  
  // Check for open-ended questions first
  if (lowercaseQuestion.includes('please share') || 
      lowercaseQuestion.includes('additional thoughts') ||
      lowercaseQuestion.includes('open-ended') ||
      options.length === 0) {
    return 'text';
  }
  
  // For questions 1-9, default to multiple_choice
  // Question 10 would be caught by the open-ended check above
  return 'multiple_choice';
};

export const extractSurveyTitle = (content: string): string | null => {
  // Look for survey title patterns
  const titleMatch = content.match(/\*\*Survey Question Set:\s*(.*?)\*\*/i) ||
                    content.match(/Survey on\s+(.*?)(?=\.|$)/i) || 
                    content.match(/(.*?)\s+survey(?=\.|$)/i);
  
  if (titleMatch && titleMatch[1]) {
    return `${titleMatch[1]} Survey`;
  }

  // Try to extract a title from the first line if it doesn't contain typical question words
  const lines = content.split('\n');
  if (lines && lines.length > 0) {
    const firstLine = lines[0].trim().replace(/^#+\s*/, ''); // Remove markdown headers
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
  const topics = ['monkey', 'monkeys', 'boba', 'coffee', 'tea', 'food', 'restaurant', 'shopping', 'service'];
  for (const topic of topics) {
    if (content.toLowerCase().includes(topic)) {
      return `${topic.charAt(0).toUpperCase() + topic.slice(1)} Survey`;
    }
  }

  return "Customer Feedback Survey";
};
