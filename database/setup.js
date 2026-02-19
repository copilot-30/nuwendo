#!/usr/bin/env node

/**
 * Database Setup Script
 * Runs migrations and seeds in one command
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runCommand = (command, args, cwd = __dirname) => {
  return new Promise((resolve, reject) => {
    console.log(`\n→ Running: ${command} ${args.join(' ')}`);
    const proc = spawn(command, args, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });
    
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
};

async function setup() {
  try {
    console.log('\n🗄️  DATABASE SETUP STARTING...\n');
    console.log('This will:');
    console.log('  1. Run all migrations');
    console.log('  2. Seed admin account');
    console.log('  3. Seed services');
    console.log('  4. Seed schedule\n');

    // Run migrations
    console.log('📋 Step 1: Running migrations...');
    await runCommand('npm', ['run', 'migrate']);

    // Run main seed (admin account)
    console.log('\n👤 Step 2: Creating admin account...');
    await runCommand('npm', ['run', 'seed']);

    // Run services seed
    console.log('\n💼 Step 3: Seeding services...');
    await runCommand('npm', ['run', 'seed:services']);

    // Run schedule seed
    console.log('\n📅 Step 4: Seeding schedule...');
    await runCommand('npm', ['run', 'seed:schedule']);

    console.log('\n✅ DATABASE SETUP COMPLETE!\n');
    console.log('Admin Login Credentials:');
    console.log('  Email:    nuwendomc@gmail.com');
    console.log('  Password: jalaka09\n');
    console.log('🚀 You can now start the backend server!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nPlease check:');
    console.error('  1. PostgreSQL is running');
    console.error('  2. Database "nuwendo_db" exists');
    console.error('  3. Database credentials in backend/.env are correct\n');
    process.exit(1);
  }
}

setup();
