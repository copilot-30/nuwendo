import pool from './src/config/database.js';

const email = process.argv[2];

if (!email) {
  console.error('Usage: node delete-user.js <email>');
  process.exit(1);
}

const userResult = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);

if (userResult.rows.length === 0) {
  console.log(`No user found with email: ${email}`);
  process.exit(0);
}

const user = userResult.rows[0];
console.log(`Found user: id=${user.id}, email=${user.email}`);

// Delete dependent rows first
await pool.query('DELETE FROM patient_profiles WHERE user_id = $1', [user.id]);
await pool.query('DELETE FROM bookings WHERE user_id = $1', [user.id]);
await pool.query('DELETE FROM users WHERE id = $1', [user.id]);

console.log(`Deleted user ${email} and all associated data.`);
process.exit(0);
