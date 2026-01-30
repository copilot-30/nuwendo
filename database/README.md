# Database Migrations

This directory contains PostgreSQL database migrations for the Nuwendo application.

## Prerequisites

- PostgreSQL installed and running
- Node.js installed

## Setup

### 1. Create Database

First, create the database in PostgreSQL:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nuwendo_db;

# Exit psql
\q
```

### 2. Configure Environment Variables

Update the database credentials in `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nuwendo_db
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 3. Install Dependencies

```bash
cd database
npm install
```

### 4. Run Migrations

```bash
# Run all pending migrations
npm run migrate

# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:down
```

## Migration Structure

### Users Table

The first migration creates the `users` table with the following fields:

- `id` - Primary key (auto-increment)
- `email` - Unique email address
- `password_hash` - Hashed password (bcrypt)
- `first_name` - User's first name
- `last_name` - User's last name
- `is_verified` - Email verification status
- `verification_token` - Token for email verification
- `reset_password_token` - Token for password reset
- `reset_password_expires` - Expiration timestamp for reset token
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp (auto-updated via trigger)
- `last_login` - Last login timestamp

**Indexes:**
- `idx_users_email` - Fast email lookups
- `idx_users_verification_token` - Fast verification token lookups
- `idx_users_reset_password_token` - Fast reset token lookups

**Triggers:**
- `update_users_updated_at` - Automatically updates `updated_at` on row changes

## Creating New Migrations

To create a new migration:

1. Create two files in `migrations/` directory:
   - `00X_migration_name.sql` - The migration
   - `00X_migration_name_rollback.sql` - The rollback

2. Increment the number (001, 002, 003, etc.)

3. Run `npm run migrate` to apply

Example:
```sql
-- 002_create_posts_table.sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Commands

- `npm run migrate` - Run all pending migrations
- `npm run migrate:down` - Rollback the last migration
- `npm run migrate:status` - Check which migrations have been applied

## Migration Tracking

Migrations are tracked in the `migrations` table, which is automatically created on first run. This table stores:
- Migration name
- Applied timestamp

Each migration runs in a transaction, so if it fails, no changes are committed.

---

## Recent Migrations

### Migration 006: Appointment Type for Time Slots ⭐ NEW
- **File**: `006_add_appointment_type_to_time_slots.sql`
- **Rollback**: `006_add_appointment_type_to_time_slots_rollback.sql`
- **Description**: Adds `appointment_type` column to time_slots table
- **Values**: 
  - `online` - Only available for online appointments
  - `on-site` - Only available for on-site appointments  
  - `both` - Available for both types (default)
- **Purpose**: Enables separate scheduling for online and on-site appointments

**Schema Change:**
```sql
ALTER TABLE time_slots 
ADD COLUMN appointment_type VARCHAR(20) DEFAULT 'both' NOT NULL 
CHECK (appointment_type IN ('online', 'on-site', 'both'));

CREATE INDEX idx_time_slots_type ON time_slots(appointment_type);
```

### Migration 007: Appointment Type for Bookings ⭐ NEW
- **File**: `007_add_appointment_type_to_bookings.sql`
- **Rollback**: `007_add_appointment_type_to_bookings_rollback.sql`
- **Description**: Adds `appointment_type` column to bookings table
- **Values**: 
  - `online` - Online appointment (video call)
  - `on-site` - On-site appointment (clinic visit)
- **Default**: `on-site`
- **Purpose**: Tracks which type of appointment was booked

**Schema Change:**
```sql
ALTER TABLE bookings 
ADD COLUMN appointment_type VARCHAR(20) DEFAULT 'on-site' NOT NULL 
CHECK (appointment_type IN ('online', 'on-site'));

CREATE INDEX idx_bookings_type ON bookings(appointment_type);
```

## Appointment Type Feature

The appointment type feature allows the platform to support both online (video call) and on-site (clinic visit) appointments with separate scheduling.

### How It Works
1. **Admin creates time slots** via `/admin/schedule` with appointment_type:
   - `online` - Slot only available for online appointments
   - `on-site` - Slot only available for on-site appointments
   - `both` - Slot available for either type (default)

2. **Patient selects appointment type** when booking:
   - Frontend filters available slots based on selection
   - Backend API validates slot availability for chosen type
   - Prevents double-booking per appointment type

3. **Booking stores appointment_type**:
   - Records whether appointment is online or on-site
   - Displayed throughout booking flow and confirmation
   - Admin can see appointment type in booking management

### API Updates
- **GET** `/api/availability?date=YYYY-MM-DD&type=online|on-site` - Filtered slots
- **POST** `/api/booking` - Now requires `appointmentType` field
- **GET/POST/PUT** `/api/admin/time-slots` - Now supports `appointment_type` field

### Frontend Updates
- `/choose-schedule` - Appointment type selection buttons
- `/payment` - Shows selected appointment type
- `/confirmation` - Displays appointment type with icon
- `/admin/schedule` - Appointment type management UI
