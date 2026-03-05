#!/usr/bin/env node

import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\n🔍 CHECKING RAILWAY DATABASE TABLES...\n');

const DATABASE_URL = 'postgresql://postgres:eiVFkgzRyRmXCoAUGtDvgWukyxATexGn@shinkansen.proxy.rlwy.net:10659/railway';

async function checkTables() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: false });
  
  try {
    await client.connect();
    console.log('✓ Connected to Railway database\n');

    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tables in database:');
    if (tablesResult.rows.length === 0) {
      console.log('   ❌ NO TABLES FOUND!');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
    }

    console.log('\n📊 Table row counts:');
    for (const row of tablesResult.rows) {
      const countResult = await client.query(`SELECT COUNT(*) FROM ${row.table_name}`);
      console.log(`   ${row.table_name}: ${countResult.rows[0].count} rows`);
    }

    // Check migrations table
    console.log('\n🔄 Migrations status:');
    const migrationsExist = tablesResult.rows.some(r => r.table_name === 'migrations');
    if (migrationsExist) {
      const migrationsResult = await client.query('SELECT name FROM migrations ORDER BY name');
      console.log(`   Applied: ${migrationsResult.rows.length} migrations`);
      migrationsResult.rows.forEach(m => {
        console.log(`   ✓ ${m.name}`);
      });
    } else {
      console.log('   ❌ Migrations table does not exist!');
      console.log('   ⚠️  Database has not been initialized with migrations!');
    }

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();
