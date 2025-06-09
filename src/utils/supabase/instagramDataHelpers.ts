
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, wrapSupabaseOperation } from './errorHandler';
import type { InstagramScrapedData } from '../types/database';

export const insertInstagramData = async (data: InstagramScrapedData[]) => {
  if (!data || data.length === 0) {
    throw new Error('Instagram data is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data: result, error } = await supabase
      .from('instadatascrapper')
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  }, 'Inserting Instagram scraped data', 'Instagram data saved successfully!');
};

export const fetchInstagramData = async (limit?: number, location?: string) => {
  return wrapSupabaseOperation(async () => {
    let query = supabase
      .from('instadatascrapper')
      .select('*')
      .order('scraped_at', { ascending: false });
    
    if (location) {
      query = query.eq('location', location);
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }, `Fetching Instagram data${location ? ` for location ${location}` : ''}`);
};

export const fetchInstagramDataByUsername = async (username: string) => {
  if (!username) {
    throw new Error('Username is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('instadatascrapper')
      .select('*')
      .eq('instagram_username', username)
      .order('scraped_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }, `Fetching Instagram data for username ${username}`);
};

export const deleteInstagramData = async (id: string) => {
  if (!id) {
    throw new Error('ID is required');
  }
  
  return wrapSupabaseOperation(async () => {
    const { error } = await supabase
      .from('instadatascrapper')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }, `Deleting Instagram data ${id}`, 'Instagram data deleted successfully!');
};

export const getInstagramDataStats = async () => {
  return wrapSupabaseOperation(async () => {
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('instadatascrapper')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    // Get unique locations count
    const { data: locations, error: locationsError } = await supabase
      .from('instadatascrapper')
      .select('location')
      .not('location', 'is', null);
    
    if (locationsError) throw locationsError;
    
    const uniqueLocations = new Set(locations?.map(l => l.location)).size;
    
    // Get data from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { count: recentCount, error: recentError } = await supabase
      .from('instadatascrapper')
      .select('*', { count: 'exact', head: true })
      .gte('scraped_at', yesterday.toISOString());
    
    if (recentError) throw recentError;
    
    return {
      totalRecords: totalCount || 0,
      uniqueLocations,
      recentRecords: recentCount || 0
    };
  }, 'Fetching Instagram data statistics');
};
