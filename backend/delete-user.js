import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nuwendo_db',
  password: 'nuwendopassword',
  port: 5432,
});

async function deleteUser(email) {
  try {
    const res = await pool.query('DELETE FROM users WHERE email = $1 RETURNING id, email', [email]);
    if (res.rowCount === 0) {
      console.log('No user found with email:', email);
    } else {
      console.log('Deleted user:', res.rows[0]);
    }
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error deleting user:', err);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node delete-user.js user@example.com');
  process.exit(1);
}
deleteUser(email);
