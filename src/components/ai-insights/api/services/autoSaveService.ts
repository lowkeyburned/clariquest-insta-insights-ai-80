
import { DataRouter } from '../../services/dataRouter';
import { BusinessWithSurveyCount } from '@/utils/types/database';

/**
 * Service for automatically saving AI-generated content to appropriate tables
 */
export class AutoSaveService {
  
  /**
   * Processes AI response and automatically saves extracted data
   */
  static async processAIResponse(
    aiResponse: string, 
    business: BusinessWithSurveyCount,
    userMessage: string
  ): Promise<void> {
    try {
      console.log('AutoSaveService: Processing AI response for auto-save', {
        businessId: business.id,
        responseLength: aiResponse.length
      });
      
      // Extract structured data from AI response
      const extractedData = this.extractStructuredData(aiResponse, business, userMessage);
      
      // Route and save each piece of data
      for (const dataItem of extractedData) {
        await DataRouter.routeAndSave(dataItem.data, dataItem.context);
      }
      
    } catch (error) {
      console.error('AutoSaveService: Error processing AI response:', error);
      // Don't throw - this is a background process
    }
  }
  
  /**
   * Extracts structured data from AI response text
   */
  private static extractStructuredData(
    response: string, 
    business: BusinessWithSurveyCount,
    userMessage: string
  ): Array<{ data: any; context: string }> {
    const extractedData: Array<{ data: any; context: string }> = [];
    
    // Check if response contains survey-related content
    if (this.isSurveyContent(response)) {
      const surveyData = this.extractSurveyData(response, business);
      if (surveyData) {
        extractedData.push({
          data: surveyData,
          context: 'survey creation from AI chat'
        });
      }
      
      // Extract questions if present
      const questionsData = this.extractQuestionsData(response, business);
      if (questionsData.length > 0) {
        questionsData.forEach(questionData => {
          extractedData.push({
            data: questionData,
            context: 'survey question from AI chat'
          });
        });
      }
    }
    
    // Check if response contains business insights
    if (this.isBusinessInsight(response)) {
      const insightData = this.extractBusinessInsight(response, business, userMessage);
      if (insightData) {
        extractedData.push({
          data: insightData,
          context: 'business insight from AI chat'
        });
      }
    }
    
    return extractedData;
  }
  
  /**
   * Checks if response contains survey-related content
   */
  private static isSurveyContent(response: string): boolean {
    const surveyKeywords = ['survey', 'questionnaire', 'feedback', 'questions'];
    return surveyKeywords.some(keyword => 
      response.toLowerCase().includes(keyword)
    );
  }
  
  /**
   * Checks if response contains business insights
   */
  private static isBusinessInsight(response: string): boolean {
    const insightKeywords = ['analyze', 'insights', 'trends', 'performance', 'metrics'];
    return insightKeywords.some(keyword => 
      response.toLowerCase().includes(keyword)
    );
  }
  
  /**
   * Extracts survey metadata from AI response
   */
  private static extractSurveyData(response: string, business: BusinessWithSurveyCount): any | null {
    try {
      // Look for survey title and description patterns
      const titleMatch = response.match(/survey[\s\w]*?:\s*([^\n\r]+)/i);
      const descMatch = response.match(/description[\s\w]*?:\s*([^\n\r]+)/i);
      
      if (titleMatch || this.isSurveyContent(response)) {
        return {
          title: titleMatch?.[1]?.trim() || this.generateSurveyTitle(response),
          description: descMatch?.[1]?.trim() || 'AI-generated survey from chat insights',
          business_id: business.id,
          is_active: true,
          slug: this.generateSlug(titleMatch?.[1] || 'ai-survey')
        };
      }
    } catch (error) {
      console.error('Error extracting survey data:', error);
    }
    
    return null;
  }
  
  /**
   * Extracts question data from AI response
   */
  private static extractQuestionsData(response: string, business: BusinessWithSurveyCount): any[] {
    const questions: any[] = [];
    
    try {
      // Match numbered questions (1. Question text)
      const questionMatches = response.match(/\d+\.\s+([^\n\r]+)/g);
      
      if (questionMatches) {
        questionMatches.forEach((match, index) => {
          const questionText = match.replace(/^\d+\.\s+/, '').trim();
          
          if (questionText.length > 10) { // Valid question
            questions.push({
              question_text: questionText,
              question_type: this.determineQuestionType(questionText),
              required: true,
              order_index: index,
              // Note: survey_id will be added when we know the survey ID
            });
          }
        });
      }
    } catch (error) {
      console.error('Error extracting questions:', error);
    }
    
    return questions;
  }
  
  /**
   * Extracts business insight data
   */
  private static extractBusinessInsight(
    response: string, 
    business: BusinessWithSurveyCount,
    userMessage: string
  ): any | null {
    try {
      // This could be saved as a chat history entry or business note
      return {
        business_id: business.id,
        message: response,
        is_user_message: false,
        context_message: userMessage
      };
    } catch (error) {
      console.error('Error extracting business insight:', error);
    }
    
    return null;
  }
  
  /**
   * Generates a survey title from response content
   */
  private static generateSurveyTitle(response: string): string {
    // Extract first meaningful sentence or phrase
    const sentences = response.split(/[.!?]/);
    const firstSentence = sentences.find(s => s.trim().length > 10)?.trim();
    
    if (firstSentence) {
      return firstSentence.length > 50 
        ? firstSentence.substring(0, 50) + '...' 
        : firstSentence;
    }
    
    return 'AI-Generated Survey';
  }
  
  /**
   * Determines question type based on question text
   */
  private static determineQuestionType(questionText: string): string {
    const text = questionText.toLowerCase();
    
    if (text.includes('rate') || text.includes('scale') || text.includes('1-10')) {
      return 'slider';
    }
    
    if (text.includes('yes/no') || text.includes('true/false')) {
      return 'multiple_choice';
    }
    
    if (text.includes('explain') || text.includes('describe') || text.includes('thoughts')) {
      return 'text';
    }
    
    return 'multiple_choice'; // Default
  }
  
  /**
   * Generates a URL-friendly slug
   */
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
