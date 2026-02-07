const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nuwendo_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function seedServices() {
  const services = [
    {
      name: 'General Consultation',
      description: 'A comprehensive health checkup with our experienced physicians.',
      duration_minutes: 30,
      price: 1500.00,
      category: 'Consultation'
    },
    {
      name: 'Dental Cleaning',
      description: 'Professional teeth cleaning and oral health assessment.',
      duration_minutes: 45,
      price: 2000.00,
      category: 'Dental'
    },
    {
      name: 'Eye Examination',
      description: 'Complete eye exam including vision testing and eye health evaluation.',
      duration_minutes: 30,
      price: 1200.00,
      category: 'Ophthalmology'
    },
    {
      name: 'Physical Therapy Session',
      description: 'One-on-one therapy session for rehabilitation and pain management.',
      duration_minutes: 60,
      price: 2500.00,
      category: 'Therapy'
    },
    {
      name: 'Blood Test Package',
      description: 'Comprehensive blood work including CBC, lipid profile, and blood sugar.',
      duration_minutes: 15,
      price: 3500.00,
      category: 'Laboratory'
    },
    {
      name: 'Mental Health Counseling',
      description: 'Confidential counseling session with licensed mental health professional.',
      duration_minutes: 60,
      price: 3000.00,
      category: 'Mental Health'
    }
  ];

  try {
    console.log('Seeding services...');
    
    for (const service of services) {
      // Check if service already exists
      const existing = await pool.query(
        'SELECT id FROM services WHERE name = $1',
        [service.name]
      );
      
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO services (name, description, duration_minutes, price, category, is_active)
           VALUES ($1, $2, $3, $4, $5, true)`,
          [service.name, service.description, service.duration_minutes, service.price, service.category]
        );
        console.log(`✓ Added service: ${service.name}`);
      } else {
        console.log(`- Service already exists: ${service.name}`);
      }
    }
    
    console.log('\n✓ Services seeded successfully!');
  } catch (error) {
    console.error('Error seeding services:', error);
  } finally {
    await pool.end();
  }
}

seedServices();
