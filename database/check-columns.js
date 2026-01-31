const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nuwendo_db',
  password: 'nuwendopassword',
  port: 5432
});

async function check() {
  try {
    // Drop the problematic index
    await pool.query(`DROP INDEX IF EXISTS idx_bookings_pending_payment`);
    console.log('Dropped index idx_bookings_pending_payment');
    
    // Create a simpler index that doesn't include the receipt URL
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_pending_status 
      ON bookings(status) 
      WHERE status = 'pending'
    `);
    console.log('Created simpler index idx_bookings_pending_status');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

check();
