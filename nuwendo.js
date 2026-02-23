#!/usr/bin/env node

/**
 * ============================================
 * NUWENDO DATABASE CLI
 * ============================================
 * 
 * Similar to Laravel's artisan commands:
 * 
 *   node nuwendo db:migrate       → Create database tables (runs all migrations)
 *   node nuwendo db:fresh          → Recreate all tables (⚠️ ALL DATA GONE)
 *   node nuwendo db:seed           → Create default data (admin, services, schedule)
 *   node nuwendo db:setup          → Fresh install: migrate + seed (for new devices)
 *   node nuwendo db:status         → Show migration status
 *   node nuwendo db:rollback       → Rollback last migration
 *   node nuwendo db:create         → Create the database if it doesn't exist
 * 
 * Or use npm scripts from root:
 * 
 *   npm run db:migrate
 *   npm run db:fresh
 *   npm run db:seed
 *   npm run db:setup
 *   npm run db:status
 *   npm run db:rollback
 *   npm run db:create
 */

import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

// ============================================
// DATABASE CONFIG
// ============================================
const getConfig = (dbName = null) => ({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: dbName || process.env.DB_NAME || 'nuwendo_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

const MIGRATIONS_DIR = path.join(__dirname, 'database', 'migrations');
const SEED_DIR = path.join(__dirname, 'database');

// ============================================
// HELPERS
// ============================================
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}  ✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}  ✗ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}  ⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}  ℹ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.blue}  → ${msg}${colors.reset}`),
  dim: (msg) => console.log(`${colors.dim}    ${msg}${colors.reset}`),
};

const banner = (title) => {
  console.log('');
  console.log(`${colors.bold}${colors.cyan}  ╔══════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  ║  NUWENDO DB: ${title.padEnd(28)}║${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  ╚══════════════════════════════════════════╝${colors.reset}`);
  console.log('');
};

const getMigrationFiles = () => {
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql') && !file.includes('rollback'))
    .sort();
};

// Strip UTF-8 BOM that some editors add (PostgreSQL can't handle it)
const readSql = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
};

const getAppliedMigrations = async (client) => {
  try {
    const result = await client.query('SELECT name FROM migrations ORDER BY name');
    return result.rows.map(row => row.name);
  } catch {
    return [];
  }
};

// ============================================
// COMMAND: db:create
// ============================================
const dbCreate = async () => {
  banner('CREATE DATABASE');
  
  const dbName = process.env.DB_NAME || 'nuwendo_db';
  const client = new Client(getConfig('postgres')); // connect to default db
  
  try {
    await client.connect();
    
    // Check if database exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
    );
    
    if (result.rows.length > 0) {
      log.info(`Database "${dbName}" already exists`);
    } else {
      await client.query(`CREATE DATABASE ${dbName}`);
      log.success(`Database "${dbName}" created`);
    }
  } catch (error) {
    log.error(`Failed to create database: ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
};

// ============================================
// COMMAND: db:drop
// ============================================
const dbDrop = async () => {
  banner('DROP DATABASE');
  
  const dbName = process.env.DB_NAME || 'nuwendo_db';
  
  console.log(`${colors.red}${colors.bold}  ⚠️  WARNING: This will COMPLETELY DELETE the database "${dbName}"!${colors.reset}`);
  console.log(`${colors.red}     All tables, data, and everything inside will be gone permanently.${colors.reset}`);
  console.log(`${colors.red}     This is like deleting a Docker container's database volume.${colors.reset}`);
  console.log('');
  
  // Connect to the default 'postgres' database (can't drop a DB you're connected to)
  const client = new Client(getConfig('postgres'));
  
  try {
    await client.connect();
    
    // Check if database exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
    );
    
    if (result.rows.length === 0) {
      log.info(`Database "${dbName}" does not exist. Nothing to drop.`);
      return;
    }
    
    // Terminate all active connections to the database first
    log.step('Terminating active connections...');
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid();
    `, [dbName]);
    
    // Drop the database
    log.step(`Dropping database "${dbName}"...`);
    await client.query(`DROP DATABASE ${dbName}`);
    
    log.success(`Database "${dbName}" has been completely deleted!`);
    console.log('');
    log.info('To start fresh, run: node nuwendo.js db:setup');
    console.log('');
    
  } catch (error) {
    log.error(`Failed to drop database: ${error.message}`);
    if (error.message.includes('being accessed by other users')) {
      log.warn('Make sure to stop the backend server first before dropping the database.');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
};

// ============================================
// COMMAND: db:migrate
// ============================================
const dbMigrate = async () => {
  banner('MIGRATE');
  
  const client = new Client(getConfig());
  
  try {
    await client.connect();
    log.success('Connected to database');
    
    // Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    const applied = await getAppliedMigrations(client);
    const files = getMigrationFiles();
    const pending = files.filter(f => !applied.includes(f));
    
    if (pending.length === 0) {
      log.info('No pending migrations. Database is up to date.');
      console.log('');
      return;
    }
    
    console.log(`  Running ${pending.length} migration(s)...\n`);
    
    for (const file of pending) {
      const sql = readSql(path.join(MIGRATIONS_DIR, file));
      
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        log.success(`Applied: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        log.error(`Failed: ${file}`);
        log.error(error.message);
        process.exit(1);
      }
    }
    
    console.log('');
    log.success(`All ${pending.length} migration(s) applied successfully!`);
    console.log('');
    
  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
};

// ============================================
// COMMAND: db:fresh
// ============================================
const dbFresh = async () => {
  banner('FRESH (RESET ALL)');
  
  console.log(`${colors.red}${colors.bold}  ⚠️  WARNING: This will DROP ALL TABLES and recreate them!${colors.reset}`);
  console.log(`${colors.red}     All data will be permanently deleted!${colors.reset}`);
  console.log('');
  
  const client = new Client(getConfig());
  
  try {
    await client.connect();
    log.success('Connected to database');
    
    // Drop all tables in public schema
    log.step('Dropping all tables...');
    
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    
    // Also drop custom types/enums if any
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e') LOOP
          EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    
    log.success('All tables dropped');
    console.log('');
    
    // Now run all migrations from scratch
    log.step('Running all migrations from scratch...');
    console.log('');
    
    // Create migrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    const files = getMigrationFiles();
    
    for (const file of files) {
      const sql = readSql(path.join(MIGRATIONS_DIR, file));
      
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        log.success(`Applied: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        log.error(`Failed: ${file}`);
        log.error(error.message);
        log.warn('Some migrations may reference tables from previous migrations.');
        log.warn('Continuing with next migration...');
      }
    }
    
    console.log('');
    log.success('Database recreated from scratch!');
    log.warn('Run "node nuwendo db:seed" to add default data');
    console.log('');
    
  } catch (error) {
    log.error(`Fresh failed: ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
};

// ============================================
// COMMAND: db:seed
// ============================================
const dbSeed = async () => {
  banner('SEED DEFAULT DATA');
  
  const client = new Client(getConfig());
  
  try {
    await client.connect();
    log.success('Connected to database');
    console.log('');
    
    // 1. Seed admin user
    log.step('Seeding admin user...');
    try {
      // Use a resilient upsert approach — ON CONFLICT on email (most reliable)
      await client.query(`
        INSERT INTO admin_users (username, email, password_hash, full_name, role) 
        VALUES (
          'admin', 
          'nuwendomc@gmail.com', 
          '$2b$10$nlPjwIXVFIjXyNt4YCdZveYTpzMJ8FOaX5pT2BXRH6BsLf1j1c4tu',
          'Nuwendo Admin',
          'super_admin'
        ) ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role;
      `);
      log.success('Admin user seeded (nuwendomc@gmail.com)');
    } catch {
      // Admin already exists from migration — that's fine
      log.success('Admin user exists (nuwendomc@gmail.com)');
    }
    
    // 2. Seed services
    log.step('Seeding services...');
    const servicesSql = readSql(path.join(SEED_DIR, 'seed-services.sql'));
    try {
      // Ensure unique constraint exists for ON CONFLICT to work
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS services_name_unique ON services(name);
      `);
      await client.query(servicesSql);
      log.success('Services seeded (5 services)');
    } catch (error) {
      log.warn(`Services seed warning: ${error.message}`);
    }
    
    // 3. Seed working hours / schedule
    log.step('Seeding working hours...');
    const scheduleSql = readSql(path.join(SEED_DIR, 'seed-schedule.sql'));
    try {
      await client.query(scheduleSql);
      log.success('Working hours seeded (7 days)');
    } catch (error) {
      log.warn(`Schedule seed warning: ${error.message}`);
    }
    
    // 4. Seed reschedule settings
    log.step('Seeding reschedule settings...');
    try {
      await client.query(`
        INSERT INTO reschedule_settings (
          patient_min_hours_before, admin_min_hours_before, 
          max_reschedules_per_booking, allow_patient_reschedule, allow_admin_reschedule
        ) VALUES (24, 1, 3, true, true)
        ON CONFLICT DO NOTHING;
      `);
      log.success('Reschedule settings seeded');
    } catch (error) {
      log.warn(`Reschedule settings warning: ${error.message}`);
    }
    
    console.log('');
    log.success('All seed data applied!');
    console.log('');
    log.info('Default Admin:');
    log.dim('Email:    nuwendomc@gmail.com');
    log.dim('Password: jalaka09');
    console.log('');
    
  } catch (error) {
    log.error(`Seed failed: ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
};

// ============================================
// COMMAND: db:setup  (migrate + seed in one go)
// ============================================
const dbSetup = async () => {
  banner('FULL SETUP');
  log.info('This will run migrations and seed default data');
  console.log('');
  
  await dbCreate();
  console.log('');
  await dbMigrate();
  console.log('');
  await dbSeed();
  
  console.log(`${colors.bold}${colors.green}  ════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.green}   Database is ready! 🎉${colors.reset}`);
  console.log(`${colors.bold}${colors.green}  ════════════════════════════════════════════${colors.reset}`);
  console.log('');
};

// ============================================
// COMMAND: db:status
// ============================================
const dbStatus = async () => {
  banner('MIGRATION STATUS');
  
  const client = new Client(getConfig());
  
  try {
    await client.connect();
    log.success('Connected to database');
    console.log('');
    
    const applied = await getAppliedMigrations(client);
    const files = getMigrationFiles();
    
    // Get applied with timestamps
    let appliedDetails = [];
    try {
      const result = await client.query('SELECT name, applied_at FROM migrations ORDER BY name');
      appliedDetails = result.rows;
    } catch {
      // migrations table might not exist
    }
    
    const appliedMap = {};
    appliedDetails.forEach(row => { appliedMap[row.name] = row.applied_at; });
    
    console.log(`  Total migration files: ${files.length}`);
    console.log(`  Applied: ${applied.length}`);
    console.log(`  Pending: ${files.length - applied.length}`);
    console.log('');
    
    files.forEach(file => {
      if (applied.includes(file)) {
        const date = appliedMap[file] ? new Date(appliedMap[file]).toLocaleDateString() : '';
        console.log(`  ${colors.green}✓${colors.reset} ${file} ${colors.dim}(${date})${colors.reset}`);
      } else {
        console.log(`  ${colors.yellow}○${colors.reset} ${file} ${colors.yellow}(pending)${colors.reset}`);
      }
    });
    
    console.log('');
    
    // Show table counts
    log.step('Table row counts:');
    const tables = ['users', 'bookings', 'services', 'working_hours', 'admin_users', 'patient_profiles'];
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        log.dim(`${table}: ${result.rows[0].count} rows`);
      } catch {
        log.dim(`${table}: (table not found)`);
      }
    }
    console.log('');
    
  } catch (error) {
    log.error(`Status check failed: ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
};

// ============================================
// COMMAND: db:rollback
// ============================================
const dbRollback = async () => {
  banner('ROLLBACK LAST');
  
  const client = new Client(getConfig());
  
  try {
    await client.connect();
    log.success('Connected to database');
    
    const applied = await getAppliedMigrations(client);
    
    if (applied.length === 0) {
      log.info('No migrations to rollback');
      return;
    }
    
    const lastMigration = applied[applied.length - 1];
    const rollbackFile = lastMigration.replace('.sql', '_rollback.sql');
    const rollbackPath = path.join(MIGRATIONS_DIR, rollbackFile);
    
    if (!fs.existsSync(rollbackPath)) {
      log.error(`Rollback file not found: ${rollbackFile}`);
      log.warn('You can manually create the rollback file or use db:fresh to reset everything');
      process.exit(1);
    }
    
    log.step(`Rolling back: ${lastMigration}`);
    
    const sql = readSql(rollbackPath);
    
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('DELETE FROM migrations WHERE name = $1', [lastMigration]);
    await client.query('COMMIT');
    
    log.success(`Rolled back: ${lastMigration}`);
    console.log('');
    
  } catch (error) {
    log.error(`Rollback failed: ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
};

// ============================================
// COMMAND: help
// ============================================
const showHelp = () => {
  console.log('');
  console.log(`${colors.bold}${colors.cyan}  NUWENDO DATABASE CLI${colors.reset}`);
  console.log('');
  console.log(`  ${colors.bold}Usage:${colors.reset}  node nuwendo <command>`);
  console.log(`          ${colors.dim}or${colors.reset}   npm run <command>`);
  console.log('');
  console.log(`  ${colors.bold}Commands:${colors.reset}`);
  console.log('');
  console.log(`  ${colors.green}db:migrate${colors.reset}    Create database tables (runs pending migrations)`);
  console.log(`               ${colors.dim}Like: php artisan migrate${colors.reset}`);
  console.log('');
  console.log(`  ${colors.red}db:fresh${colors.reset}      Recreate all tables ${colors.red}(⚠️ ALL DATA GONE)${colors.reset}`);
  console.log(`               ${colors.dim}Like: php artisan migrate:fresh${colors.reset}`);
  console.log('');
  console.log(`  ${colors.yellow}db:seed${colors.reset}       Create default data (admin, services, schedule)`);
  console.log(`               ${colors.dim}Like: php artisan db:seed${colors.reset}`);
  console.log('');
  console.log(`  ${colors.cyan}db:setup${colors.reset}      Fresh install: create DB + migrate + seed`);
  console.log(`               ${colors.dim}Perfect for cloning on a new device${colors.reset}`);
  console.log('');
  console.log(`  ${colors.blue}db:status${colors.reset}     Show migration status & table counts`);
  console.log('');
  console.log(`  ${colors.yellow}db:rollback${colors.reset}   Rollback last migration`);
  console.log('');
  console.log(`  ${colors.blue}db:create${colors.reset}     Create the database (if it doesn't exist)`);
  console.log('');
  console.log(`  ${colors.red}db:drop${colors.reset}       ${colors.red}Completely DELETE the database (like removing a Docker container)${colors.reset}`);
  console.log('');
  console.log(`  ${colors.bold}Quick Start (new device):${colors.reset}`);
  console.log('');
  console.log(`    1. Clone the repo`);
  console.log(`    2. ${colors.dim}cp backend/.env.example backend/.env${colors.reset}  (edit DB credentials)`);
  console.log(`    3. ${colors.green}node nuwendo db:setup${colors.reset}             (creates DB + tables + data)`);
  console.log(`    4. ${colors.dim}npm run install:all${colors.reset}                 (install dependencies)`);
  console.log(`    5. ${colors.dim}npm run dev:backend${colors.reset}                 (start backend)`);
  console.log(`    6. ${colors.dim}npm run dev:frontend${colors.reset}                (start frontend)`);
  console.log('');
};

// ============================================
// CLI ROUTER
// ============================================
const command = process.argv[2];

const commands = {
  'db:migrate': dbMigrate,
  'db:fresh': dbFresh,
  'db:seed': dbSeed,
  'db:setup': dbSetup,
  'db:status': dbStatus,
  'db:rollback': dbRollback,
  'db:create': dbCreate,
  'db:drop': dbDrop,
  'help': showHelp,
  '--help': showHelp,
  '-h': showHelp,
};

if (!command || !commands[command]) {
  if (command) {
    console.log(`\n${colors.red}  Unknown command: ${command}${colors.reset}`);
  }
  showHelp();
  process.exit(command ? 1 : 0);
} else {
  const result = commands[command]();
  if (result && typeof result.catch === 'function') {
    result.catch(err => {
      log.error(err.message);
      process.exit(1);
    });
  }
}
