# Working Hours System - Simplified Timeslot Management

## What Changed?

### Before:
- Admin had to manually create **individual 30-minute timeslots** (e.g., 9:00-9:30, 9:30-10:00, 10:00-10:30, etc.)
- Very tedious to set up a full day of availability
- Had to create dozens of entries just for one day

### After:
- Admin just sets **start time and end time** for each day (e.g., 7:30 AM - 5:30 PM)
- System **automatically generates** 30-minute interval slots
- Much simpler and more flexible

## Database Changes

### New Table: `working_hours`
```sql
- id
- day_of_week (0-6, where 0=Sunday, 6=Saturday)
- start_time (e.g., '07:30:00')
- end_time (e.g., '17:30:00')
- appointment_type ('online' or 'on-site')
- slot_interval_minutes (default: 30)
- is_active
- created_at, updated_at
- created_by, updated_by
```

### Old Table Removed: `time_slots`
- Replaced by `working_hours`
- Existing data was migrated (converted individual slots to start/end times)

## Backend Changes

### `availability.js`
- Now queries `working_hours` table
- Automatically generates 30-minute slots between start_time and end_time
- Still respects booking conflicts and service durations

### `adminController.js`
- `createTimeSlot()` - Now creates/updates working hours (not individual slots)
- `updateTimeSlot()` - Updates working hours for a day
- `deleteTimeSlot()` - Deletes working hours for a day
- `getTimeSlots()` - Returns working hours (not individual slots)

## Example Usage

### Setting Up Monday (On-Site):
```json
{
  "day_of_week": 1,
  "start_time": "07:30",
  "end_time": "17:30",
  "appointment_type": "on-site"
}
```

This automatically creates slots:
- 07:30-08:00
- 08:00-08:30
- 08:30-09:00
- ...
- 17:00-17:30

## Benefits

1. **Easier Setup**: Set once per day instead of 20+ individual entries
2. **Flexible**: Change start/end times and all slots update automatically
3. **Consistent**: Each day has uniform intervals (30 minutes)
4. **Less Data**: One row per day instead of dozens of rows

## Migration Status

✓ Migration 010 applied successfully
✓ Old `time_slots` data migrated to `working_hours`
✓ Backend routes updated
✓ Availability logic updated with service duration checking

## Next Steps

The Admin Schedule UI will need to be updated to:
- Show working hours (start/end time) instead of individual slots
- Allow editing start/end time for each day
- Preview the generated slots
