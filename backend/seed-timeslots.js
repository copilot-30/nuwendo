import pool from './src/config/database.js';

async function seedTimeSlots() {
  // Generate time slots from 9 AM to 5 PM, every 30 minutes, for weekdays (Mon-Fri)
  const slots = [];
  
  for (let day = 1; day <= 5; day++) { // Monday (1) to Friday (5)
    for (let hour = 9; hour < 17; hour++) { // 9 AM to 5 PM
      slots.push({
        day_of_week: day,
        start_time: `${hour.toString().padStart(2, '0')}:00`,
        end_time: `${hour.toString().padStart(2, '0')}:30`
      });
      slots.push({
        day_of_week: day,
        start_time: `${hour.toString().padStart(2, '0')}:30`,
        end_time: `${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }
  }

  try {
    console.log('Seeding time slots...');
    
    // Check if slots already exist
    const existing = await pool.query('SELECT COUNT(*) FROM time_slots');
    
    if (parseInt(existing.rows[0].count) > 0) {
      console.log(`- Time slots already exist (${existing.rows[0].count} slots found)`);
      console.log('- Skipping seed...');
      return;
    }
    
    for (const slot of slots) {
      await pool.query(
        `INSERT INTO time_slots (day_of_week, start_time, end_time, is_active)
         VALUES ($1, $2, $3, true)`,
        [slot.day_of_week, slot.start_time, slot.end_time]
      );
    }
    
    console.log(`✓ Added ${slots.length} time slots`);
    console.log('\n✓ Time slots seeded successfully!');
  } catch (error) {
    console.error('Error seeding time slots:', error);
  } finally {
    await pool.end();
  }
}

seedTimeSlots();
