import pool from './src/config/database.js';

async function addAppointmentTypeToBookings() {
  try {
    console.log('Adding appointment_type column to bookings table...\n');

    // Add appointment_type column
    await pool.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(20) DEFAULT 'on-site'
    `);
    console.log('✓ Column added to bookings table');

    // Add constraint
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'bookings_appointment_type_check'
        ) THEN
          ALTER TABLE bookings 
          ADD CONSTRAINT bookings_appointment_type_check 
          CHECK (appointment_type IN ('online', 'on-site'));
        END IF;
      END $$;
    `);
    console.log('✓ Constraint added to bookings table');

    // Update existing bookings
    await pool.query(`
      UPDATE bookings 
      SET appointment_type = 'on-site' 
      WHERE appointment_type IS NULL
    `);
    console.log('✓ Existing bookings updated to "on-site"');

    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await pool.end();
  }
}

addAppointmentTypeToBookings();
