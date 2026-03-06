#!/usr/bin/env node

/**
 * Startup Script
 * Checks if database tables exist, runs migrations if needed, then starts server
 */

import pool from './src/config/database.js';
import { spawn } from 'child_process';

const checkTables = async () => {
  try {
    // Check if admin_users table exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
      );
    `);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
};

const runMigrations = () => {
  return new Promise((resolve, reject) => {
    console.log('\n⚙️  Running database migrations...\n');
    
    const proc = spawn('npm', ['run', 'migrate'], {
      cwd: './database',
      stdio: 'inherit',
      shell: true
    });
    
    proc.on('close', (code) => {
      if (code !== 0) {
        console.error('\n❌ Migrations failed with code:', code);
        reject(new Error(`Migrations failed with code ${code}`));
      } else {
        console.log('\n✅ Migrations completed successfully\n');
        resolve();
      }
    });
  });
};

const runSeeds = () => {
  return new Promise((resolve, reject) => {
    console.log('\n⚙️  Running database seeds...\n');
    
    const proc = spawn('npm', ['run', 'seed:all'], {
      cwd: './database',
      stdio: 'inherit',
      shell: true
    });
    
    proc.on('close', (code) => {
      if (code !== 0) {
        console.log('\n⚠️  Seeds completed with warnings (code:', code, ')');
        // Don't reject - seeds might partially fail
      } else {
        console.log('\n✅ Seeds completed successfully\n');
      }
      resolve();
    });
  });
};

const startServer = () => {
  console.log('\n🚀 Starting server...\n');
  const proc = spawn('node', ['server.js'], {
    stdio: 'inherit',
    shell: true
  });
  
  proc.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code);
  });
};

async function startup() {
  try {
    console.log('\n🔍 Checking database status...\n');
    
    const tablesExist = await checkTables();
    
    if (!tablesExist) {
      console.log('⚠️  Database tables not found. Running setup...\n');
      await runMigrations();
      await runSeeds();
    } else {
      console.log('✅ Database tables exist. Running migrations to apply any new changes...\n');
      await runMigrations();
    }
    
    await pool.end();
    startServer();
    
  } catch (error) {
    console.error('\n❌ Startup failed:', error);
    console.log('\n⚠️  Attempting to start server anyway...\n');
    startServer();
  }
}

startup();
