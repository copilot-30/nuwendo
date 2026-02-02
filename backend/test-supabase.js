import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test upload
async function testUpload() {
  try {
    // Create a simple test image (1x1 red pixel PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(testImageBase64, 'base64');
    
    const fileName = `test-${Date.now()}.png`;
    
    console.log('\nUploading test file to bucket "uploads"...');
    
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(`receipts/${fileName}`, buffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (error) {
      console.error('❌ Upload failed:', error);
      return;
    }

    console.log('✅ Upload successful!');
    console.log('Data:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path);

    console.log('✅ Public URL:', publicUrl);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testUpload();
