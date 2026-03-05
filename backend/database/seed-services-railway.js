#!/usr/bin/env node

import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\n💼 SEEDING SERVICES TO RAILWAY DATABASE...\n');

// Database configuration - prioritize DATABASE_URL for Railway
const config = process.env.DATABASE_URL 
  ? { 
      connectionString: process.env.DATABASE_URL, 
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false 
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'nuwendo_db',
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
    };

async function seedServices() {
  const client = new Client(config);
  
  try {
    // Connect to database
    await client.connect();
    console.log('✓ Connected to database');

    // Read seed file
    const seedFile = path.join(__dirname, 'seed-services.sql');
    let sql = fs.readFileSync(seedFile, 'utf8');
    console.log('✓ Read seed-services.sql');

    // Remove ON CONFLICT clause since unique constraint doesn't exist
    const simpleInsert = `
      INSERT INTO services (name, description, duration_minutes, price, category, is_active) VALUES
        ('Nuwendo Starter', 'Comprehensive Consultation + Laboratory Test Request + Nutrition Plan + Follow-up', 60, 3700.00, 'Services', true),
        ('Comprehensive Consultation', 'Complete health consultation with our metabolic specialist', 60, 2000.00, 'Services', true),
        ('Nutrition Plan', 'Personalized nutrition plan tailored to your metabolic needs', 60, 1500.00, 'Services', true),
        ('Follow-up', 'Follow-up consultation to track your progress', 30, 800.00, 'Services', true),
        ('Medical Certificate', 'Official medical certificate for various purposes', 15, 500.00, 'Services', true);
    `;

    // Execute SQL
    await client.query(simpleInsert);
    console.log('✓ Services seeded successfully\n');

    // Verify services were inserted
    const result = await client.query('SELECT id, name, price, is_active FROM services ORDER BY id');
    console.log('📋 Services in database:');
    result.rows.forEach(service => {
      console.log(`   ${service.id}. ${service.name} - ₱${service.price} (${service.is_active ? 'Active' : 'Inactive'})`);
    });
    console.log('\n✅ SEEDING COMPLETE!\n');

  } catch (error) {
    console.error('\n❌ Error seeding services:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedServices();
