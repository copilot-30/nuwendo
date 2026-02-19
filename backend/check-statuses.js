import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nuwendo_db',
  password: 'nuwendopassword',
  port: 5432
});

async function checkBookingStatuses() {
  try {
    // Check distinct statuses
    const statusResult = await pool.query('SELECT DISTINCT status FROM bookings ORDER BY status');
    console.log('\n=== BOOKING STATUSES IN DATABASE ===\n');
    console.log('Available status values:');
    statusResult.rows.forEach(r => console.log('  -', r.status));

    // Check a sample booking
    const sampleResult = await pool.query('SELECT id, status, business_status FROM bookings ORDER BY id DESC LIMIT 5');
    console.log('\n=== RECENT BOOKINGS ===\n');
    console.table(sampleResult.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkBookingStatuses();
