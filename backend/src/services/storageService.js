import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
// Note: dotenv is loaded via src/config/env.js before server.js imports
const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials in .env file (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * Upload a file to Supabase Storage (retries once on timeout — handles cold-start paused projects)
 * @param {string} bucket - The storage bucket name
 * @param {string} filePath - The path/name for the file in storage
 * @param {Buffer} fileBuffer - The file data as a buffer
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<{url: string}>} - The public URL of the uploaded file
 */
export const uploadFile = async (bucket, filePath, fileBuffer, contentType, attempt = 1) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true
      });

    if (error) {
      // Retry once on timeout errors (Supabase project cold start after pause)
      const isTimeout = error.message?.toLowerCase().includes('timeout') || 
                        error.message?.toLowerCase().includes('timed out');
      if (isTimeout && attempt === 1) {
        console.log('Supabase timeout on first attempt, retrying in 3s...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        return uploadFile(bucket, filePath, fileBuffer, contentType, 2);
      }
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrl };
  } catch (error) {
    console.error('Upload file error:', error);
    throw error;
  }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} bucket - The storage bucket name
 * @param {string} filePath - The path/name of the file in storage
 * @returns {Promise<void>}
 */
export const deleteFile = async (bucket, filePath) => {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  } catch (error) {
    console.error('Delete file error:', error);
    throw error;
  }
};

/**
 * Upload a base64 encoded image to Supabase Storage
 * @param {string} base64Data - Base64 encoded image data (with or without data URI prefix)
 * @param {string} folder - The folder/prefix for organizing files (e.g., 'receipts', 'profile-images')
 * @returns {Promise<{url: string}>} - The public URL of the uploaded image
 */
export const uploadBase64Image = async (base64Data, folder = 'receipts') => {
  try {
    // Remove data URI prefix if present (data:image/png;base64,...)
    const base64String = base64Data.includes(',') 
      ? base64Data.split(',')[1] 
      : base64Data;

    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, 'base64');

    // Detect content type from data URI or default to image/jpeg
    let contentType = 'image/jpeg';
    if (base64Data.includes('data:')) {
      const match = base64Data.match(/data:([^;]+);/);
      if (match) contentType = match[1];
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = contentType.split('/')[1] || 'jpg';
    const fileName = `${folder}/${timestamp}-${randomString}.${extension}`;

    // Upload to Supabase (using 'uploads' bucket)
    return await uploadFile('uploads', fileName, buffer, contentType);
  } catch (error) {
    console.error('Upload base64 image error:', error);
    throw error;
  }
};

export default getSupabaseClient;
