const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nuwendo_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
};

const checkStatus = async () => {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✓ Connected to database\n');
    
    // Check if migrations table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'migrations'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('⚠ Migrations table does not exist. Run migrations first.');
      return;
    }
    
    // Get applied migrations
    const applied = await client.query('SELECT name, applied_at FROM migrations ORDER BY name');
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && !file.includes('rollback'))
      .sort();
    
    console.log('Migration Status:\n');
    console.log('Applied Migrations:');
    console.log('-------------------');
    
    if (applied.rows.length === 0) {
      console.log('  (none)');
    } else {
      applied.rows.forEach(row => {
        const date = new Date(row.applied_at).toLocaleString();
        console.log(`  ✓ ${row.name} (${date})`);
      });
    }
    
    const appliedNames = applied.rows.map(r => r.name);
    const pending = files.filter(f => !appliedNames.includes(f));
    
    console.log('\nPending Migrations:');
    console.log('-------------------');
    
    if (pending.length === 0) {
      console.log('  (none)');
    } else {
      pending.forEach(file => {
        console.log(`  ○ ${file}`);
      });
    }
    
    console.log(`\nTotal: ${applied.rows.length} applied, ${pending.length} pending\n`);
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

checkStatus();
