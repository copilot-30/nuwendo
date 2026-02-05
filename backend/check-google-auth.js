import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nuwendo_db',
  password: 'nuwendopassword',
  port: 5432
});

async function checkGoogleAuth() {
  try {
    const result = await pool.query(
      `SELECT setting_key, 
              CASE 
                WHEN setting_value IS NULL OR setting_value = '' THEN 'Missing'
                ELSE 'Configured'
              END as status
       FROM system_settings 
       WHERE setting_key LIKE 'google%'
       ORDER BY setting_key`
    );

    console.log('\n📅 Google Calendar OAuth Status:\n');
    
    if (result.rows.length === 0) {
      console.log('❌ No Google OAuth tokens found');
      console.log('\n⚠️  Google Calendar is NOT connected!');
      console.log('   Please visit: http://localhost:5000/api/oauth/google/authorize');
    } else {
      result.rows.forEach(row => {
        const icon = row.status === 'Configured' ? '✅' : '❌';
        console.log(`${icon} ${row.setting_key}: ${row.status}`);
      });
      
      const allConfigured = result.rows.every(row => row.status === 'Configured');
      if (allConfigured) {
        console.log('\n✅ Google Calendar is connected and ready!');
        console.log('   Appointments will create Google Meet links automatically.');
      } else {
        console.log('\n⚠️  Some Google OAuth settings are missing');
      }
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkGoogleAuth();
