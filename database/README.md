# Database Setup# Database Migrations



Complete database setup for Nuwendo application.This directory contains PostgreSQL database migrations for the Nuwendo application.



## 🚀 Quick Setup (Recommended)## Prerequisites



```bash- PostgreSQL installed and running

# 1. Create database- Node.js installed

createdb -U postgres nuwendo_db

## Setup

# 2. Set password (Windows PowerShell)

$env:PGPASSWORD='admin'### 1. Create Database



# 3. Run complete setupFirst, create the database in PostgreSQL:

npm run setup

``````bash

# Connect to PostgreSQL

**That's it!** This will:psql -U postgres

- ✅ Run all 21 migrations

- ✅ Create admin account (nuwendomc@gmail.com / jalaka09)# Create database

- ✅ Seed 5 servicesCREATE DATABASE nuwendo_db;

- ✅ Seed working hours schedule

# Exit psql

---\q

```

## 📋 Available Commands

### 2. Configure Environment Variables

```bash

npm run setup           # Complete setup (migrations + all seeds)Update the database credentials in `backend/.env`:

npm run migrate         # Run migrations only

npm run migrate:status  # Check migration status```env

npm run migrate:down    # Rollback last migrationDB_HOST=localhost

npm run seed           # Seed admin account onlyDB_PORT=5432

npm run seed:services  # Seed services onlyDB_NAME=nuwendo_db

npm run seed:schedule  # Seed schedule onlyDB_USER=postgres

```DB_PASSWORD=your_password_here

```

---

### 3. Install Dependencies

## 🗄️ What Gets Created

```bash

### Migrations (21 files)cd database

1. Users tablenpm install

2. Patient tables```

3. Verification codes

4. Booking tables### 4. Run Migrations

5. Admin system

6. Time slots```bash

7. Appointment types# Run all pending migrations

8. System settingsnpm run migrate

9. Working hours

10. Patient profiles# Check migration status

11. Payment receiptsnpm run migrate:status

12. Reschedule functionality

13. And more...# Rollback last migration

npm run migrate:down

### Seeds```



**Admin Account** (`seed.sql`):## Migration Structure

- Email: nuwendomc@gmail.com

- Password: jalaka09### Users Table

- Role: super_admin

The first migration creates the `users` table with the following fields:

**Services** (`seed-services.sql`):

- Nuwendo Starter - ₱3,700- `id` - Primary key (auto-increment)

- Comprehensive Consultation - ₱2,000- `email` - Unique email address

- Nutrition Plan - ₱1,500- `password_hash` - Hashed password (bcrypt)

- Follow-up - ₱800- `first_name` - User's first name

- Medical Certificate - ₱500- `last_name` - User's last name

- `is_verified` - Email verification status

**Schedule** (`seed-schedule.sql`):- `verification_token` - Token for email verification

- Online consultations: Sun, Mon, Tue, Sat (7:30 AM - 5:30 PM)- `reset_password_token` - Token for password reset

- On-site visits: Wed, Thu, Fri (9:00 AM - 5:00 PM)- `reset_password_expires` - Expiration timestamp for reset token

- `created_at` - Account creation timestamp

---- `updated_at` - Last update timestamp (auto-updated via trigger)

- `last_login` - Last login timestamp

## Prerequisites

**Indexes:**

- PostgreSQL 14 or higher- `idx_users_email` - Fast email lookups

- Node.js 18 or higher- `idx_users_verification_token` - Fast verification token lookups

- Database user: `admin` with password `admin`- `idx_users_reset_password_token` - Fast reset token lookups



## Configuration**Triggers:**

- `update_users_updated_at` - Automatically updates `updated_at` on row changes

Update `backend/.env`:

## Creating New Migrations

```env

DB_HOST=localhostTo create a new migration:

DB_PORT=5432

DB_NAME=nuwendo_db1. Create two files in `migrations/` directory:

DB_USER=admin   - `00X_migration_name.sql` - The migration

DB_PASSWORD=admin   - `00X_migration_name_rollback.sql` - The rollback

```

2. Increment the number (001, 002, 003, etc.)

---

3. Run `npm run migrate` to apply

## 🔧 Troubleshooting

Example:

### Setup Script Fails```sql

-- 002_create_posts_table.sql

1. Check PostgreSQL is running:CREATE TABLE posts (

   ```bash    id SERIAL PRIMARY KEY,

   Get-Service postgresql*  # Windows    user_id INTEGER REFERENCES users(id),

   ```    title VARCHAR(255) NOT NULL,

    content TEXT,

2. Verify database exists:    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

   ```bash);

   psql -U postgres -l```

   ```

## Commands

3. Check credentials in `backend/.env`

- `npm run migrate` - Run all pending migrations

### Manual Setup (if npm run setup fails)- `npm run migrate:down` - Rollback the last migration

- `npm run migrate:status` - Check which migrations have been applied

```bash

# Set password## Migration Tracking

$env:PGPASSWORD='admin'

Migrations are tracked in the `migrations` table, which is automatically created on first run. This table stores:

# Run each step manually- Migration name

npm run migrate- Applied timestamp

npm run seed

npm run seed:servicesEach migration runs in a transaction, so if it fails, no changes are committed.

npm run seed:schedule

```---



---## Recent Migrations



## 📝 Migration Files### Migration 006: Appointment Type for Time Slots ⭐ NEW

- **File**: `006_add_appointment_type_to_time_slots.sql`

All migrations are in `migrations/` folder:- **Rollback**: `006_add_appointment_type_to_time_slots_rollback.sql`

- `001-021` - Core database schema- **Description**: Adds `appointment_type` column to time_slots table

- Each file is idempotent and can be re-run safely- **Values**: 

- Migrations are tracked in `schema_migrations` table  - `online` - Only available for online appointments

  - `on-site` - Only available for on-site appointments  

---  - `both` - Available for both types (default)

- **Purpose**: Enables separate scheduling for online and on-site appointments

## 🔄 Reset Database

**Schema Change:**

To completely reset and start fresh:```sql

ALTER TABLE time_slots 

```bashADD COLUMN appointment_type VARCHAR(20) DEFAULT 'both' NOT NULL 

# Drop and recreate databaseCHECK (appointment_type IN ('online', 'on-site', 'both'));

dropdb -U postgres nuwendo_db

createdb -U postgres nuwendo_dbCREATE INDEX idx_time_slots_type ON time_slots(appointment_type);

```

# Run setup again

npm run setup### Migration 007: Appointment Type for Bookings ⭐ NEW

```- **File**: `007_add_appointment_type_to_bookings.sql`

- **Rollback**: `007_add_appointment_type_to_bookings_rollback.sql`

---- **Description**: Adds `appointment_type` column to bookings table

- **Values**: 

For more information, see the main [README.md](../README.md)  - `online` - Online appointment (video call)

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
