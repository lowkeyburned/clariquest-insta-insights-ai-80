
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';

/**
 * Business management functions with comprehensive error handling
 * Note: These functions will return empty data since the database tables were cleared
 */

export const fetchBusinesses = async () => {
  return wrapSupabaseOperation(async () => {
    console.log('Businesses table does not exist - returning empty array');
    return [];
  }, 'Fetching businesses');
};

export const fetchSurveysForBusiness = async (businessId: string) => {
  if (!businessId) {
    throw new Error('Business ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    console.log('Surveys table does not exist - returning empty array');
    return [];
  }, `Fetching surveys for business ${businessId}`);
};

export const fetchBusinessById = async (id: string) => {
  if (!id) {
    throw new Error('Business ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    console.log('Businesses table does not exist - returning null');
    return null;
  }, `Fetching business ${id}`);
};

export const createBusiness = async (businessData: any) => {
  if (!businessData?.name?.trim()) {
    throw new Error('Business name is required');
  }
  
  return wrapSupabaseOperation(async () => {
    console.log('Businesses table does not exist - cannot create business');
    throw new Error('Database tables not available. Please recreate the database schema.');
  }, 'Creating business');
};

export const updateBusiness = async (id: string, businessData: any) => {
  if (!id) {
    throw new Error('Business ID is required');
  }
  
  if (!businessData || Object.keys(businessData).length === 0) {
    throw new Error('Business data is required for update');
  }
  
  return wrapSupabaseOperation(async () => {
    console.log('Businesses table does not exist - cannot update business');
    throw new Error('Database tables not available. Please recreate the database schema.');
  }, `Updating business ${id}`);
};

export const deleteBusiness = async (id: string) => {
  if (!id) {
    throw new Error('Business ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    console.log('Businesses table does not exist - cannot delete business');
    throw new Error('Database tables not available. Please recreate the database schema.');
  }, `Deleting business ${id}`);
};
