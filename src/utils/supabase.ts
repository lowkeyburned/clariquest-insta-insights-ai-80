// Export everything from the supabase utilities
export * from './supabase/index';

// Keep existing functions for backward compatibility
export { fetchSurveyById, fetchSurveyBySlug } from './supabase/database';
