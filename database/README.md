# Database Setup

## PostgreSQL Setup

### 1. Install PostgreSQL
Download and install PostgreSQL from: https://www.postgresql.org/download/

### 2. Create Database
```sql
CREATE DATABASE nowendo_db;
```

### 3. Run Migrations
```bash
cd database
psql -U postgres -d nowendo_db -f schema.sql
psql -U postgres -d nowendo_db -f seed.sql
```

## Database Configuration
Update the `.env` file in the backend folder with your database credentials.
