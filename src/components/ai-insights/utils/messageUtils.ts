
import { Message } from "../types/message";

/**
 * Checks if a message contains survey-related content
 */
export const isSurveyRelatedMessage = (content: string): boolean => {
  return content.toLowerCase().includes("survey") || 
         content.toLowerCase().includes("question");
};

/**
 * Creates a new user message object
 */
export const createUserMessage = (content: string): Message => {
  return {
    id: Date.now().toString(),
    role: "user",
    content: content,
    timestamp: new Date(),
  };
};

/**
 * Creates a new AI assistant message object
 */
export const createAssistantMessage = (content: string, isSurveyRelated: boolean = false): Message => {
  return {
    id: Date.now().toString(),
    role: "assistant",
    content: content,
    timestamp: new Date(),
    hasSurveyData: isSurveyRelated
  };
};

/**
 * Creates a fallback AI message when the API call fails
 */
export const createFallbackMessage = (): Message => {
  return {
    id: Date.now().toString(),
    role: "assistant",
    content: "Sorry, I couldn't connect to the AI service. Please check your webhook connection and try again.",
    timestamp: new Date(),
  };
};
