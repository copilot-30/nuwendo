import pool from './src/config/database.js';

async function addAppointmentType() {
  try {
    console.log('Adding appointment_type column to time_slots table...\n');

    // Add appointment_type column
    await pool.query(`
      ALTER TABLE time_slots 
      ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(20) DEFAULT 'both'
    `);
    console.log('✓ Column added');

    // Add constraint
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'time_slots_appointment_type_check'
        ) THEN
          ALTER TABLE time_slots 
          ADD CONSTRAINT time_slots_appointment_type_check 
          CHECK (appointment_type IN ('online', 'on-site', 'both'));
        END IF;
      END $$;
    `);
    console.log('✓ Constraint added');

    // Update existing slots
    await pool.query(`
      UPDATE time_slots 
      SET appointment_type = 'both' 
      WHERE appointment_type IS NULL
    `);
    console.log('✓ Existing slots updated to "both"');

    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await pool.end();
  }
}

addAppointmentType();
