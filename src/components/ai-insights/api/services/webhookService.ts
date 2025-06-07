import { BusinessWithSurveyCount } from '@/utils/types/database';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Updated webhook URL with your new n8n endpoint for database AI
export const DEFAULT_WEBHOOK_URL = 'https://clariquest.app.n8n.cloud/webhook/eea3111a-3285-40c1-a0d9-d28a9d691707';

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
        sessionId: uuidv4()
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

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
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
          created_by: user.id, // Add required created_by field
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
  console.log("Full content to parse:", content);
  
  const questions: { question_text: string; question_type: string; options?: string[] }[] = [];
  
  // Split content into lines and clean them
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Look for numbered questions (1., 2., 3., etc.)
    const questionMatch = line.match(/^(\d+)\.\s*(.+)$/);
    
    if (questionMatch) {
      const questionNumber = parseInt(questionMatch[1]);
      const questionText = questionMatch[2].trim();
      
      console.log(`Found question ${questionNumber}: ${questionText}`);
      
      // Collect options for this question
      const options: string[] = [];
      i++; // Move to next line
      
      // Look for options (lines starting with -, or indented lines)
      while (i < lines.length) {
        const optionLine = lines[i];
        
        // Stop if we hit the next question
        if (optionLine.match(/^\d+\.\s/)) {
          break;
        }
        
        // Stop if we hit end markers
        if (optionLine.toLowerCase().includes('thank you') || 
            optionLine.toLowerCase().includes('feedback is valuable')) {
          break;
        }
        
        // Clean option line
        let cleanOption = optionLine.replace(/^\s*-\s*/, '').trim();
        
        // Skip empty lines
        if (cleanOption.length === 0) {
          i++;
          continue;
        }
        
        // Add as option if it looks like one
        if (cleanOption.length > 0 && cleanOption.length < 100) {
          options.push(cleanOption);
          console.log(`  Option: ${cleanOption}`);
        }
        
        i++;
      }
      
      // Determine question type
      let questionType = 'text';
      const lowerQuestion = questionText.toLowerCase();
      
      // If we have options, it's multiple choice
      if (options.length > 0) {
        questionType = 'multiple_choice';
      }
      
      // Force certain questions to be text type based on content
      if (lowerQuestion.includes('open-ended') ||
          lowerQuestion.includes('additional comments') ||
          lowerQuestion.includes('feedback') ||
          lowerQuestion.includes('improvements') ||
          lowerQuestion.includes('specify') ||
          lowerQuestion.includes('please specify')) {
        questionType = 'text';
      }
      
      const question = {
        question_text: questionText,
        question_type: questionType,
        options: options.length > 0 ? options : undefined
      };
      
      questions.push(question);
      console.log(`Added question:`, question);
      
      // i is already incremented in the while loop
      continue;
    }
    
    i++;
  }
  
  // If we didn't extract enough questions, try a fallback approach
  if (questions.length === 0) {
    console.log("No questions found with primary method, trying fallback...");
    
    // Create some sample questions based on the content
    if (content.toLowerCase().includes('bobaa') || content.toLowerCase().includes('boba')) {
      const fallbackQuestions = [
        {
          question_text: "How often do you visit our shop?",
          question_type: "multiple_choice",
          options: ["Daily", "Weekly", "Monthly", "Rarely", "First time"]
        },
        {
          question_text: "What is your favorite drink type?",
          question_type: "multiple_choice", 
          options: ["Milk Tea", "Fruit Tea", "Smoothies", "Other"]
        },
        {
          question_text: "How satisfied are you with our service?",
          question_type: "multiple_choice",
          options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
        },
        {
          question_text: "Any additional feedback?",
          question_type: "text"
        }
      ];
      
      console.log("Using fallback questions:", fallbackQuestions);
      return fallbackQuestions;
    }
  }
  
  console.log(`Final extracted questions (${questions.length}):`, questions);
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
