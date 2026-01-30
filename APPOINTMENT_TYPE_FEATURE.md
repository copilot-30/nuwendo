# Online/On-Site Appointment Feature - Full Stack Implementation

## ✅ COMPLETED IMPLEMENTATION

### 1. Database Schema Updates

**Migration Files Created:**
- `add-appointment-type.js` - Adds `appointment_type` column to `time_slots` table
- `add-appointment-type-bookings.js` - Adds `appointment_type` column to `bookings` table

**Changes:**
- **time_slots table**: Added `appointment_type VARCHAR(20)` with constraint ('online', 'on-site', 'both')
  - Default value: 'both' (available for both types)
  - Existing slots updated to 'both'
  
- **bookings table**: Added `appointment_type VARCHAR(20)` with constraint ('online', 'on-site')
  - Default value: 'on-site'
  - Existing bookings updated to 'on-site'

### 2. Backend API Updates

**File: `src/routes/availability.js`**
- Added `type` query parameter support
- Filters time slots based on appointment type
- Returns slots where `appointment_type = requested_type` OR `appointment_type = 'both'`
- Checks bookings for specific type to avoid double-booking

**File: `src/routes/booking.js`**
- Added validation for `appointmentType` field (must be 'online' or 'on-site')
- Required field in booking creation

**File: `src/controllers/bookingController.js`**
- Updated `createBooking` to accept and validate `appointmentType`
- Checks availability for specific appointment type before booking
- Stores appointment type in database

### 3. Frontend Updates

**File: `pages/ChooseSchedule/index.tsx`**
- Added appointment type selection UI with two buttons:
  - **Online** (Monitor icon) - Video consultation
  - **On-Site** (Building2 icon) - Clinic visit
- State management for `appointmentType` (default: 'on-site')
- Fetches availability with type parameter: `?date=YYYY-MM-DD&type=online|on-site`
- Stores selection in sessionStorage
- Resets selected slot when type changes
- Beautiful UI with icons and color-coded selection

**File: `pages/Payment/index.tsx`**
- Retrieves `appointmentType` from sessionStorage
- Retrieves `patientDetails` from sessionStorage (for firstName, lastName, contactNumber)
- Sends appointment type in booking request
- Displays appointment type in booking summary with color-coded badge:
  - Online: Blue badge
  - On-Site: Green badge

**File: `pages/Confirmation/index.tsx`**
- Retrieves `appointmentType` from sessionStorage
- Displays appointment type with appropriate icon (Monitor for online, Building2 for on-site)
- Shows descriptive text: "Online (Video Call)" or "On-Site (Clinic Visit)"

### 4. Data Flow

```
1. User selects appointment type (Online/On-Site) → ChooseSchedule
2. Appointment type stored in sessionStorage
3. Availability API called with type parameter
4. Filtered slots displayed based on type
5. User selects date and time
6. Payment page shows booking summary with type
7. Booking created with appointmentType field
8. Confirmation page displays full booking details including type
```

### 5. API Endpoints

**GET `/api/availability`**
```
Query Parameters:
- date: YYYY-MM-DD (required)
- type: 'online' | 'on-site' | 'both' (optional, default: 'both')

Response:
{
  success: true,
  date: "2026-01-30",
  dayOfWeek: 4,
  appointmentType: "online",
  availableSlots: [...]
}
```

**POST `/api/booking/create`**
```
Body:
{
  email: string,
  serviceId: number,
  bookingDate: string,
  bookingTime: string,
  appointmentType: 'online' | 'on-site', // NEW REQUIRED FIELD
  firstName: string,
  lastName: string,
  phoneNumber: string,
  paymentMethod: string
}
```

### 6. Session Storage Keys

- `appointmentType`: 'online' | 'on-site'
- `bookingDate`: YYYY-MM-DD
- `bookingTime`: HH:MM
- `patientDetails`: JSON object with patient information

### 7. Admin Considerations

Administrators can now:
- Create time slots with specific appointment types
- View bookings filtered by appointment type
- Manage online and on-site availability separately

### 8. Future Enhancements (Not Implemented)

- Admin UI to set appointment_type when creating/editing time slots
- Admin dashboard to view bookings by type
- Different pricing for online vs on-site
- Video call integration for online appointments
- Email templates differentiated by appointment type

## Testing Checklist

✅ Database migrations run successfully
✅ Backend API accepts and validates appointment type
✅ Frontend displays appointment type selection
✅ Availability filtered by type
✅ Booking created with correct type
✅ Confirmation shows appointment type
✅ No compilation errors
✅ TypeScript types updated

## Notes

- All existing time slots are set to 'both' by default
- All existing bookings are set to 'on-site' by default
- The system prevents double-booking for the same time slot and type
- Online and on-site appointments can coexist in the same time slot if configured
