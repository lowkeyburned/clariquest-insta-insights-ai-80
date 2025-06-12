
import { supabase } from '@/integrations/supabase/client';
import { wrapSupabaseOperation } from './errorHandler';
import { generateSlugFromTitle, generateRandomSlug, isValidSlug } from '../slugUtils';

/**
 * Generate a unique slug for a survey
 */
export const generateUniqueSlug = async (title?: string): Promise<string> => {
  return wrapSupabaseOperation(async () => {
    let slug: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      slug = title ? generateSlugFromTitle(title) : generateRandomSlug();
      attempts++;

      // Check if slug already exists
      const { data, error } = await supabase
        .from('surveys')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      
      // If no existing survey found, slug is unique
      if (!data) {
        return slug;
      }
    } while (attempts < maxAttempts);

    // If we couldn't generate a unique slug, use a random one with timestamp
    return `${generateRandomSlug()}-${Date.now().toString(36)}`;
  }, 'Generating unique slug');
};

/**
 * Update survey slug
 */
export const updateSurveySlug = async (surveyId: string, newSlug: string) => {
  if (!isValidSlug(newSlug)) {
    throw new Error('Invalid slug format. Use only lowercase letters, numbers, and hyphens.');
  }

  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('surveys')
      .update({ slug: newSlug })
      .eq('id', surveyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }, `Updating survey slug to ${newSlug}`);
};

/**
 * Check if a slug is available
 */
export const isSlugAvailable = async (slug: string): Promise<boolean> => {
  if (!isValidSlug(slug)) {
    return false;
  }

  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('surveys')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return !data; // Return true if no survey found (slug is available)
  }, `Checking slug availability for ${slug}`);
};
