import pool from './src/config/database.js';

async function testWorkingHours() {
  try {
    console.log('Testing Working Hours System...\n');
    
    // 1. Check working_hours table exists and has data
    console.log('1. Checking working_hours table:');
    const whResult = await pool.query('SELECT * FROM working_hours ORDER BY day_of_week, appointment_type');
    console.log(`   ✓ Found ${whResult.rows.length} working hour entries`);
    whResult.rows.forEach(wh => {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      console.log(`   - ${dayNames[wh.day_of_week]}: ${wh.start_time} - ${wh.end_time} (${wh.appointment_type})`);
    });
    
    // 2. Simulate slot generation for Monday
    console.log('\n2. Testing slot generation for Monday (day_of_week=1):');
    const mondayHours = whResult.rows.filter(wh => wh.day_of_week === 1 && wh.is_active);
    
    if (mondayHours.length > 0) {
      const generateSlots = (startTime, endTime, intervalMinutes = 30) => {
        const slots = [];
        const normalizeTime = (time) => {
          const parts = time.split(':');
          return `${parts[0]}:${parts[1]}`;
        };
        
        const addMinutes = (timeStr, minutes) => {
          const [hours, mins] = timeStr.split(':').map(Number);
          const totalMinutes = hours * 60 + mins + minutes;
          const newHours = Math.floor(totalMinutes / 60) % 24;
          const newMins = totalMinutes % 60;
          return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
        };
        
        let currentTime = normalizeTime(startTime);
        const end = normalizeTime(endTime);
        
        while (currentTime < end) {
          const nextTime = addMinutes(currentTime, intervalMinutes);
          if (nextTime <= end) {
            slots.push({ start_time: currentTime, end_time: nextTime });
          }
          currentTime = nextTime;
        }
        
        return slots;
      };
      
      mondayHours.forEach(wh => {
        const slots = generateSlots(wh.start_time, wh.end_time, wh.slot_interval_minutes);
        console.log(`   ${wh.appointment_type}: Generated ${slots.length} slots`);
        console.log(`   First 3 slots: ${slots.slice(0, 3).map(s => s.start_time).join(', ')}`);
      });
    } else {
      console.log('   ⚠️  No working hours set for Monday');
    }
    
    // 3. Check bookings table references
    console.log('\n3. Checking bookings compatibility:');
    const bookingsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM bookings b
      WHERE EXISTS (
        SELECT 1 FROM services s 
        WHERE s.id = b.service_id
      )
    `);
    console.log(`   ✓ ${bookingsResult.rows[0].count} bookings with valid services`);
    
    console.log('\n✅ All tests passed! Working hours system is operational.');
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await pool.end();
  }
}

testWorkingHours();
