import pool from './src/config/database.js';

async function updateServices() {
  const newServices = [
    // SERVICES
    {
      name: 'Nuwendo Starter',
      description: 'Comprehensive Consultation + Laboratory Test Request + Nutrition Plan + Follow-up',
      duration_minutes: 60,
      price: 3700.00,
      category: 'Package'
    },
    {
      name: 'Comprehensive Consultation',
      description: 'Complete health consultation with our metabolic specialist',
      duration_minutes: 45,
      price: 2000.00,
      category: 'Consultation'
    },
    {
      name: 'Nutrition Plan',
      description: 'Personalized nutrition plan tailored to your metabolic needs',
      duration_minutes: 30,
      price: 1500.00,
      category: 'Nutrition'
    },
    {
      name: 'Follow-up',
      description: 'Follow-up consultation to track your progress',
      duration_minutes: 30,
      price: 800.00,
      category: 'Consultation'
    },
    // PEPTIDES
    {
      name: 'Tirzepatide 50mg',
      description: 'Tirzepatide peptide therapy - 50mg dose',
      duration_minutes: 15,
      price: 15000.00,
      category: 'Peptides'
    },
    {
      name: 'Tirzepatide 30mg',
      description: 'Tirzepatide peptide therapy - 30mg dose',
      duration_minutes: 15,
      price: 9000.00,
      category: 'Peptides'
    },
    {
      name: 'Tirzepatide Per Shot',
      description: 'Tirzepatide peptide therapy - Per shot (done in clinic)',
      duration_minutes: 15,
      price: 2500.00,
      category: 'Peptides'
    },
    {
      name: 'Semaglutide 8mg',
      description: 'Semaglutide peptide therapy - 8mg dose',
      duration_minutes: 15,
      price: 9000.00,
      category: 'Peptides'
    },
    {
      name: 'Semaglutide 16mg',
      description: 'Semaglutide peptide therapy - 16mg dose',
      duration_minutes: 15,
      price: 16000.00,
      category: 'Peptides'
    },
    {
      name: 'Semaglutide Per Shot',
      description: 'Semaglutide peptide therapy - Per shot (done in clinic)',
      duration_minutes: 15,
      price: 2000.00,
      category: 'Peptides'
    },
    // MEDICAL CERTIFICATE
    {
      name: 'Medical Certificate',
      description: 'Official medical certificate for various purposes',
      duration_minutes: 15,
      price: 500.00,
      category: 'Documentation'
    }
  ];

  try {
    console.log('Updating services...\n');
    
    // First, delete all existing services
    console.log('Deleting all existing services...');
    await pool.query('DELETE FROM services');
    console.log('✓ All existing services deleted\n');
    
    // Insert new services
    console.log('Adding new services:');
    for (const service of newServices) {
      await pool.query(
        `INSERT INTO services (name, description, duration_minutes, price, category, is_active)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [service.name, service.description, service.duration_minutes, service.price, service.category]
      );
      console.log(`✓ Added: ${service.name} - ₱${service.price.toLocaleString()}`);
    }
    
    console.log('\n✓ Services updated successfully!');
    console.log(`Total services: ${newServices.length}`);
  } catch (error) {
    console.error('Error updating services:', error);
  } finally {
    await pool.end();
  }
}

updateServices();
