#!/usr/bin/env node

import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🌱 SEEDING ALL DATA TO RAILWAY DATABASE...\n');

const DATABASE_URL = 'postgresql://postgres:eiVFkgzRyRmXCoAUGtDvgWukyxATexGn@shinkansen.proxy.rlwy.net:10659/railway';

async function seedAll() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: false });
  
  try {
    await client.connect();
    console.log('✓ Connected to Railway database\n');

    // 1. Seed admin user (skip if exists)
    console.log('👤 Seeding admin user...');
    try {
      const adminSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
      await client.query(adminSql);
      console.log('✓ Admin user seeded\n');
    } catch (error) {
      if (error.code === '23505') {
        console.log('✓ Admin user already exists\n');
      } else {
        throw error;
      }
    }

    // 2. Seed working hours (schedule)
    console.log('📅 Seeding working hours/schedule...');
    const scheduleSql = fs.readFileSync(path.join(__dirname, 'seed-schedule.sql'), 'utf8');
    await client.query(scheduleSql);
    console.log('✓ Working hours seeded\n');

    // 3. Seed shop items
    console.log('🛒 Seeding shop items...');
    const shopSql = fs.readFileSync(path.join(__dirname, 'seed-shop.sql'), 'utf8');
    await client.query(shopSql);
    console.log('✓ Shop items seeded\n');

    // Verify data
    console.log('📊 Verification:\n');
    
    const adminResult = await client.query('SELECT COUNT(*) FROM admin_users');
    console.log(`   Admin users: ${adminResult.rows[0].count}`);
    
    const servicesResult = await client.query('SELECT COUNT(*) FROM services');
    console.log(`   Services: ${servicesResult.rows[0].count}`);
    
    const workingHoursResult = await client.query('SELECT COUNT(*) FROM working_hours');
    console.log(`   Working hours: ${workingHoursResult.rows[0].count}`);
    
    const shopItemsResult = await client.query('SELECT COUNT(*) FROM shop_items');
    console.log(`   Shop items: ${shopItemsResult.rows[0].count}`);
    
    const shopVariantsResult = await client.query('SELECT COUNT(*) FROM shop_item_variants');
    console.log(`   Shop variants: ${shopVariantsResult.rows[0].count}`);

    console.log('\n✅ ALL SEEDING COMPLETE!\n');
    console.log('📋 Schedule Details:');
    const scheduleResult = await client.query(`
      SELECT day_of_week, appointment_type, start_time, end_time 
      FROM working_hours 
      ORDER BY day_of_week, appointment_type
    `);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    scheduleResult.rows.forEach(row => {
      console.log(`   ${days[row.day_of_week]} (${row.appointment_type}): ${row.start_time} - ${row.end_time}`);
    });

    console.log('\n🛒 Shop Products:');
    const shopResult = await client.query(`
      SELECT si.name, siv.name as variant, siv.price 
      FROM shop_items si 
      JOIN shop_item_variants siv ON si.id = siv.shop_item_id 
      ORDER BY si.id, siv.sort_order
    `);
    shopResult.rows.forEach(row => {
      console.log(`   ${row.name} - ${row.variant}: ₱${row.price}`);
    });

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error seeding:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedAll();
