const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// Database configuration
const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nuwendo_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
};

async function runMigrations() {
  const client = new Client(config);
  await client.connect();
  console.log('✓ Connected to database');
  
  try {
    // Migration 013
    await client.query('DROP INDEX IF EXISTS idx_bookings_pending_payment');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_pending_receipt ON bookings(status, payment_receipt_url) WHERE status = 'pending' AND payment_receipt_url IS NOT NULL`);
    await client.query(`INSERT INTO migrations (name) VALUES ('013_fix_receipt_index.sql') ON CONFLICT DO NOTHING`);
    console.log('✓ Applied migration: 013_fix_receipt_index.sql');

    // Migration 014
    await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(255)');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_meeting_link ON bookings(meeting_link) WHERE meeting_link IS NOT NULL`);
    await client.query(`INSERT INTO migrations (name) VALUES ('014_add_meeting_link.sql') ON CONFLICT DO NOTHING`);
    console.log('✓ Applied migration: 014_add_meeting_link.sql');

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

runMigrations();
