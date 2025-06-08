
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

// Define valid table names to match current Supabase schema
const VALID_TABLES = [
  'businesses',
  'profiles',
  'user_roles',
  'surveys',
  'survey_questions',
  'survey_responses',
  'instagram_campaigns',
  'campaign_survey_links'
] as const;

type ValidTableName = typeof VALID_TABLES[number];

export class DataRouter {
  
  /**
   * Analyzes data and automatically routes it to the correct Supabase table
   */
  static async routeAndSave(data: any, context?: string): Promise<DataRouterResult> {
    console.log('DataRouter: Database tables do not exist - cannot save data');
    
    const result: DataRouterResult = {
      action: 'auto_save',
      table: 'unknown',
      confidence: 'LOW',
      data: data,
      reasoning: 'Database tables not available',
      alternatives: [],
      execute: false
    };
    
    toast.error('Database tables not available. Please recreate the database schema.');
    throw new Error('Database tables not available. Please recreate the database schema.');
  }
  
  /**
   * Validates if a table name is valid for Supabase operations
   */
  private static isValidTableName(tableName: string): tableName is ValidTableName {
    return VALID_TABLES.includes(tableName as ValidTableName);
  }
  
  /**
   * Analyzes data patterns to determine which table it belongs to
   */
  private static analyzeDataPatterns(data: any, context?: string): TableMatch[] {
    // Return empty array since tables don't exist
    return [];
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
    console.log('DataRouter: Cannot execute save - database tables do not exist');
    throw new Error('Database tables not available. Please recreate the database schema.');
  }
  
  /**
   * Tries alternative tables if primary save fails
   */
  private static async tryAlternatives(result: DataRouterResult): Promise<void> {
    console.log('DataRouter: Cannot try alternatives - database tables do not exist');
    throw new Error('Database tables not available. Please recreate the database schema.');
  }
}
