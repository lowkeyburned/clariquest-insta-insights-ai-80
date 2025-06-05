
// Export everything from the supabase utilities
export * from './supabase/index';

// Keep existing functions for backward compatibility
export { fetchSurveyById, fetchSurveyBySlug } from './supabase/database';

// Explicitly export campaign functions to ensure they're available
export { 
  createInstagramCampaign, 
  linkSurveyToCampaign, 
  getCampaignSurveyLinks 
} from './supabase/campaignHelpers';
