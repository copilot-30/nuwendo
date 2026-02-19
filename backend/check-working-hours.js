import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nuwendo_db',
  password: 'nuwendopassword',
  port: 5432
});

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function checkWorkingHours() {
  try {
    const result = await pool.query(
      'SELECT * FROM working_hours ORDER BY day_of_week, appointment_type'
    );

    console.log('\n=== WORKING HOURS CONFIGURATION ===\n');
    
    if (result.rows.length === 0) {
      console.log('❌ NO WORKING HOURS CONFIGURED!');
      console.log('\nYou need to configure working hours for your clinic.');
      console.log('This is why no time slots are available for reschedule.\n');
    } else {
      console.log('✅ Found', result.rows.length, 'working hour configurations:\n');
      result.rows.forEach(wh => {
        const active = wh.is_active ? '✅ Active' : '❌ Inactive';
        console.log(`${days[wh.day_of_week]} (${wh.appointment_type}):`);
        console.log(`  ${wh.start_time} - ${wh.end_time}`);
        console.log(`  Interval: ${wh.slot_interval_minutes} minutes`);
        console.log(`  Status: ${active}\n`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkWorkingHours();
