# Testing Working Hours System

## Test Steps:

### 1. Verify Database
```bash
cd c:\nowendo\backend
node -e "require('./src/config/database.js').default.query('SELECT * FROM working_hours ORDER BY day_of_week, appointment_type').then(r => console.log(JSON.stringify(r.rows, null, 2)))"
```

### 2. Test Admin Schedule UI
1. Navigate to `/admin/schedule`
2. You should see a card-based layout showing working hours by day
3. Try adding new working hours (e.g., Monday 7:30 AM - 5:30 PM, On-Site)
4. The system should show how many slots will be generated (e.g., "20 slots × 30min")

### 3. Test Patient Booking Flow
1. Create/login to a patient account
2. Select a service
3. Choose a schedule
4. The available time slots should be automatically generated from working hours
5. If a slot is booked, the system should block all required consecutive slots

### 4. Test Service Duration Blocking
1. Book a 60-minute service at 9:00 AM (on-site)
   - Should occupy the 9:00-10:00 slot
2. Try booking another appointment
   - 9:00 should be unavailable

For online (30-min slots):
1. Book a 60-minute service at 9:00 AM (online)
   - Should block 9:00-9:30 AND 9:30-10:00
2. Try booking another appointment
   - Both 9:00 and 9:30 should be unavailable

For 2-hour service (120 min):
1. Book at 9:00 AM (on-site)
   - Should block 9:00-10:00 AND 10:00-11:00
2. Book at 9:00 AM (online)
   - Should block 9:00, 9:30, 10:00, 10:30

## Expected Results:
✅ Admin can set working hours with start/end times
✅ System automatically generates 30-minute slots
✅ Patient sees available slots generated from working hours
✅ Booking a service blocks all required consecutive slots
✅ Long services (2+ hours) correctly block multiple slots
