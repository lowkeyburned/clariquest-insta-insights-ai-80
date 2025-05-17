
import { BusinessWithSurveyCount } from '@/components/business/BusinessForm';

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
): Promise<string> => {
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
        businessDescription: business.description || ''
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
 * Parses the response from the webhook to extract the AI message
 * @param data The response data from the webhook
 */
const parseWebhookResponse = (data: any): string => {
  console.log("Webhook response:", data);
  
  if (typeof data !== 'object') {
    throw new Error("Failed to parse response from webhook");
  }
  
  // Check for response or response.message to support various webhook formats
  if (data?.message) {
    return data.message;
  } else if (data?.response) {
    return data.response;
  } else if (typeof data === 'string') {
    return data;
  } else if (typeof data === 'object' && Object.keys(data).length > 0) {
    // Try to find any string property in the response that might contain our message
    const firstStringProp = Object.values(data).find(val => typeof val === 'string');
    if (firstStringProp) {
      return firstStringProp as string;
    }
  }
  
  throw new Error("Invalid response format from webhook");
};
