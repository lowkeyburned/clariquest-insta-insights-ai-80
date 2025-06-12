
import { nanoid } from 'nanoid';

/**
 * Generate a URL-friendly slug from a title
 */
export const generateSlugFromTitle = (title: string): string => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 30); // Limit length
  
  // Add random suffix to ensure uniqueness
  const randomSuffix = nanoid(6).toLowerCase();
  return `${baseSlug}-${randomSuffix}`;
};

/**
 * Generate a random slug (like Google Forms)
 */
export const generateRandomSlug = (): string => {
  return nanoid(8).toLowerCase();
};

/**
 * Validate if a slug is properly formatted
 */
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
};
