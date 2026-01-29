import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nuwendo_db',
  password: 'nuwendopassword',
  port: 5432,
});

async function fixAdminPassword() {
  try {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log('Generated hash:', hash);
    
    // Verify the hash works
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Hash verification:', isMatch);
    
    // Update in database
    const result = await pool.query(
      'UPDATE admin_users SET password_hash = $1 WHERE username = $2 RETURNING username, password_hash',
      [hash, 'admin']
    );
    
    console.log('Updated user:', result.rows[0].username);
    console.log('Stored hash:', result.rows[0].password_hash);
    
    // Verify from database
    const verifyResult = await pool.query(
      'SELECT password_hash FROM admin_users WHERE username = $1',
      ['admin']
    );
    
    const dbHash = verifyResult.rows[0].password_hash;
    const finalCheck = await bcrypt.compare(password, dbHash);
    console.log('Final verification from DB:', finalCheck);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAdminPassword();
