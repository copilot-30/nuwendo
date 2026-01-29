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
