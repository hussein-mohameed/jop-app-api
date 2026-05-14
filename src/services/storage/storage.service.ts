import { createClient } from '@supabase/supabase-js';

// Re-using the same supabase client logic
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export class StorageService {
  /**
   * Upload a file to a specific bucket
   */
  static async uploadFile(bucket: string, path: string, file: File | Blob | Buffer, contentType?: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.error('Storage upload error:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Storage service error:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete a file from a bucket
   */
  static async deleteFile(bucket: string, path: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Get public URL for a file
   */
  static getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}
