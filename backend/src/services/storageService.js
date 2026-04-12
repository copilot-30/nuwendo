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

const createValidationError = (message) => {
  const error = new Error(message);
  error.name = 'ValidationError';
  return error;
};

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]);

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
    if (typeof base64Data !== 'string' || !base64Data.trim()) {
      throw createValidationError('Invalid receipt format. Please upload a valid JPG, PNG, or WEBP image.');
    }

    const normalizedInput = base64Data.trim();

    // Detect content type from data URI or default to image/jpeg
    let contentType = 'image/jpeg';
    let base64String = normalizedInput;

    if (normalizedInput.startsWith('data:')) {
      const dataUriMatch = normalizedInput.match(/^data:([^;]+);base64,(.+)$/s);
      if (!dataUriMatch) {
        throw createValidationError('Invalid receipt format. Please upload a valid JPG, PNG, or WEBP image.');
      }

      contentType = dataUriMatch[1].toLowerCase();
      base64String = dataUriMatch[2];
    } else if (normalizedInput.includes(',')) {
      base64String = normalizedInput.split(',').pop() || '';
    }

    if (!contentType.startsWith('image/') || !ALLOWED_IMAGE_MIME_TYPES.has(contentType)) {
      throw createValidationError('Unsupported receipt image format. Please upload JPG, PNG, or WEBP.');
    }

    if (!base64String || !/^[A-Za-z0-9+/=\r\n]+$/.test(base64String)) {
      throw createValidationError('Invalid receipt content. Please re-upload a clear image file (JPG, PNG, or WEBP).');
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, 'base64');
    if (!buffer.length) {
      throw createValidationError('Invalid receipt content. Please re-upload a clear image file (JPG, PNG, or WEBP).');
    }

    if (buffer.length > 5 * 1024 * 1024) {
      throw createValidationError('Receipt image is too large. Please upload an image under 5MB.');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extensionByMimeType = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };
    const extension = extensionByMimeType[contentType] || 'jpg';
    const fileName = `${folder}/${timestamp}-${randomString}.${extension}`;

    // Upload to Supabase (using 'uploads' bucket)
    return await uploadFile('uploads', fileName, buffer, contentType);
  } catch (error) {
    console.error('Upload base64 image error:', error);
    throw error;
  }
};

export default getSupabaseClient;
