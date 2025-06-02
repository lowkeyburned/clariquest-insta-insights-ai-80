
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DataRouterResult {
  action: 'auto_save';
  table: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  data: any;
  reasoning: string;
  alternatives: string[];
  execute: boolean;
}

interface TableMatch {
  table: string;
  score: number;
  reasoning: string;
}

export class DataRouter {
  
  /**
   * Analyzes data and automatically routes it to the correct Supabase table
   */
  static async routeAndSave(data: any, context?: string): Promise<DataRouterResult> {
    console.log('DataRouter: Analyzing data for routing', { data, context });
    
    const matches = this.analyzeDataPatterns(data, context);
    const bestMatch = matches[0];
    
    if (!bestMatch) {
      throw new Error('Unable to determine appropriate table for data');
    }
    
    const confidence = this.calculateConfidence(bestMatch.score);
    const enrichedData = this.enrichDataWithTimestamps(data);
    
    const result: DataRouterResult = {
      action: 'auto_save',
      table: bestMatch.table,
      confidence,
      data: enrichedData,
      reasoning: bestMatch.reasoning,
      alternatives: matches.slice(1, 3).map(m => m.table),
      execute: true
    };
    
    // Execute the save operation
    await this.executeSave(result);
    
    return result;
  }
  
  /**
   * Analyzes data patterns to determine which table it belongs to
   */
  private static analyzeDataPatterns(data: any, context?: string): TableMatch[] {
    const matches: TableMatch[] = [];
    const fields = Object.keys(data || {});
    const values = Object.values(data || {});
    const dataStr = JSON.stringify(data).toLowerCase();
    
    // Business table detection
    if (this.matchesPattern(fields, ['name', 'industry', 'description', 'website']) ||
        this.matchesPattern(fields, ['business_name', 'company_name']) ||
        context?.includes('business') || context?.includes('company')) {
      matches.push({
        table: 'businesses',
        score: this.calculateScore(fields, ['name', 'industry', 'description', 'website', 'owner_id']),
        reasoning: 'Contains business-related fields like name, industry, description'
      });
    }
    
    // Survey table detection
    if (this.matchesPattern(fields, ['title', 'description']) && 
        (dataStr.includes('survey') || context?.includes('survey') || 
         fields.some(f => f.includes('survey')))) {
      matches.push({
        table: 'surveys',
        score: this.calculateScore(fields, ['title', 'description', 'business_id', 'is_active', 'slug']),
        reasoning: 'Contains survey metadata with title and description'
      });
    }
    
    // Survey questions detection
    if (this.matchesPattern(fields, ['question_text', 'question_type']) ||
        this.matchesPattern(fields, ['questions']) ||
        dataStr.includes('question') && (dataStr.includes('type') || dataStr.includes('text'))) {
      matches.push({
        table: 'survey_questions',
        score: this.calculateScore(fields, ['question_text', 'question_type', 'survey_id', 'options', 'required']),
        reasoning: 'Contains question structure with question_text and question_type'
      });
    }
    
    // Survey responses detection
    if (this.matchesPattern(fields, ['responses', 'answers']) ||
        this.matchesPattern(fields, ['response_data', 'submitted_at']) ||
        (context?.includes('response') && context?.includes('survey'))) {
      matches.push({
        table: 'survey_responses',
        score: this.calculateScore(fields, ['survey_id', 'responses', 'user_id']),
        reasoning: 'Contains survey response data and answers'
      });
    }
    
    // Survey templates detection
    if ((dataStr.includes('template') && dataStr.includes('survey')) ||
        this.matchesPattern(fields, ['template_name', 'template_data']) ||
        context?.includes('template')) {
      matches.push({
        table: 'survey_templates',
        score: this.calculateScore(fields, ['name', 'description', 'template_data', 'created_by']),
        reasoning: 'Contains survey template structure and reusable design'
      });
    }
    
    // User profiles detection
    if (this.matchesPattern(fields, ['email', 'full_name']) ||
        this.matchesPattern(fields, ['first_name', 'last_name']) ||
        this.matchesPattern(fields, ['avatar_url', 'user_id'])) {
      matches.push({
        table: 'profiles',
        score: this.calculateScore(fields, ['email', 'full_name', 'avatar_url']),
        reasoning: 'Contains user profile information like email and name'
      });
    }
    
    // User roles detection
    if (this.matchesPattern(fields, ['role', 'user_id']) ||
        this.matchesPattern(fields, ['permissions', 'access_level']) ||
        dataStr.includes('admin') || dataStr.includes('role')) {
      matches.push({
        table: 'user_roles',
        score: this.calculateScore(fields, ['user_id', 'role']),
        reasoning: 'Contains role and permission data'
      });
    }
    
    // Chat history detection
    if (this.matchesPattern(fields, ['message', 'user_id']) ||
        this.matchesPattern(fields, ['content', 'sender']) ||
        context?.includes('chat') || context?.includes('message')) {
      matches.push({
        table: 'chat_history',
        score: this.calculateScore(fields, ['message', 'user_id', 'business_id', 'is_user_message']),
        reasoning: 'Contains chat message data'
      });
    }
    
    // Campaign detection
    if (dataStr.includes('campaign') || dataStr.includes('instagram') ||
        this.matchesPattern(fields, ['campaign_name', 'start_date'])) {
      matches.push({
        table: 'instagram_campaigns',
        score: this.calculateScore(fields, ['name', 'description', 'business_id', 'start_date']),
        reasoning: 'Contains campaign-related data'
      });
    }
    
    // Settings detection
    if (this.matchesPattern(fields, ['key', 'value']) ||
        this.matchesPattern(fields, ['setting_name', 'setting_value']) ||
        context?.includes('setting') || context?.includes('config')) {
      matches.push({
        table: 'settings',
        score: this.calculateScore(fields, ['key', 'value', 'user_id']),
        reasoning: 'Contains configuration settings'
      });
    }
    
    // Sort by score (highest first)
    return matches.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Checks if fields match a specific pattern
   */
  private static matchesPattern(fields: string[], pattern: string[]): boolean {
    return pattern.some(p => fields.some(f => f.toLowerCase().includes(p.toLowerCase())));
  }
  
  /**
   * Calculates a score based on field matches
   */
  private static calculateScore(fields: string[], expectedFields: string[]): number {
    let score = 0;
    expectedFields.forEach(expected => {
      if (fields.some(f => f.toLowerCase() === expected.toLowerCase())) {
        score += 10; // Exact match
      } else if (fields.some(f => f.toLowerCase().includes(expected.toLowerCase()))) {
        score += 5; // Partial match
      }
    });
    return score;
  }
  
  /**
   * Determines confidence level based on score
   */
  private static calculateConfidence(score: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (score >= 20) return 'HIGH';
    if (score >= 10) return 'MEDIUM';
    return 'LOW';
  }
  
  /**
   * Adds timestamps to data
   */
  private static enrichDataWithTimestamps(data: any): any {
    const now = new Date().toISOString();
    return {
      ...data,
      created_at: data.created_at || now,
      updated_at: now
    };
  }
  
  /**
   * Executes the save operation to Supabase
   */
  private static async executeSave(result: DataRouterResult): Promise<void> {
    try {
      console.log(`DataRouter: Saving to table ${result.table}`, result.data);
      
      const { data, error } = await supabase
        .from(result.table)
        .insert([result.data])
        .select();
      
      if (error) {
        console.error(`DataRouter: Error saving to ${result.table}:`, error);
        
        // Try alternatives if primary save fails
        if (result.alternatives.length > 0) {
          await this.tryAlternatives(result);
        } else {
          throw error;
        }
      } else {
        console.log(`DataRouter: Successfully saved to ${result.table}:`, data);
        toast.success(`Data automatically saved to ${result.table}`);
      }
    } catch (error) {
      console.error('DataRouter: Failed to save data:', error);
      toast.error('Failed to save data automatically');
      throw error;
    }
  }
  
  /**
   * Tries alternative tables if primary save fails
   */
  private static async tryAlternatives(result: DataRouterResult): Promise<void> {
    for (const altTable of result.alternatives) {
      try {
        console.log(`DataRouter: Trying alternative table ${altTable}`);
        
        const { data, error } = await supabase
          .from(altTable)
          .insert([result.data])
          .select();
        
        if (!error) {
          console.log(`DataRouter: Successfully saved to alternative ${altTable}:`, data);
          toast.success(`Data saved to ${altTable} (alternative)`);
          return;
        }
      } catch (altError) {
        console.error(`DataRouter: Alternative ${altTable} also failed:`, altError);
        continue;
      }
    }
    
    throw new Error('All table save attempts failed');
  }
}
