# Nuwendo Metabolic Clinic - Full Stack Application

A complete booking and management system for Nuwendo Metabolic Clinic with patient booking, admin dashboard, and appointment management.

## 🚀 Quick Start (Fresh Clone)

### Prerequisites
- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **Git**

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd nowendo

# Install dependencies for all services
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
cd database && npm install && cd ..
```

### 2. Database Setup

```bash
# Create database
createdb -U postgres nuwendo_db
# Or using psql:
# psql -U postgres -c "CREATE DATABASE nuwendo_db;"

# Set password environment variable (Windows PowerShell)
$env:PGPASSWORD='admin'

# Run complete setup (migrations + seeds)
cd database
npm run setup
```

**That's it!** The setup script will:
- ✅ Run all 21 migrations
- ✅ Create admin account (nuwendomc@gmail.com / jalaka09)
- ✅ Seed 5 services
- ✅ Seed working hours schedule

### 3. Configure Environment

Create `backend/.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nuwendo_db
DB_USER=admin
DB_PASSWORD=admin

# Server
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email (for verification codes)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Google OAuth (for Google Meet links)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback
```

### 4. Run the Application

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm run dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Admin Login: http://localhost:5173/login
  - Email: `nuwendomc@gmail.com`
  - Password: `jalaka09`

---

## 📁 Project Structure

```
nowendo/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/     # All page components
│   │   ├── components/# Reusable components
│   │   └── services/  # API services
│   └── package.json
│
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth & validation
│   │   └── services/     # Business logic
│   ├── server.js      # Entry point
│   └── package.json
│
└── database/          # PostgreSQL migrations & seeds
    ├── migrations/    # 21 migration files
    ├── seed.sql       # Admin account
    ├── seed-services.sql
    ├── seed-schedule.sql
    ├── setup.js       # ONE-COMMAND setup script
    └── package.json
```

---

## 🔑 Default Credentials

### Admin Account
- **Email:** `nuwendomc@gmail.com`
- **Password:** `jalaka09`
- **Login URL:** http://localhost:5173/login

### Database User
- **Username:** `admin`
- **Password:** `admin`
- **Database:** `nuwendo_db`

⚠️ **IMPORTANT:** Change these credentials in production!

---

## 📚 Features

### Patient Portal
- ✅ Sign up with email verification
- ✅ Book appointments (online/in-person)
- ✅ Choose from 5 available services
- ✅ Select available time slots
- ✅ Payment integration
- ✅ View appointment history
- ✅ Reschedule appointments
- ✅ Cancel appointments (24hr notice)
- ✅ Access to exclusive shop (post-consultation)

### Admin Dashboard
- ✅ View all bookings
- ✅ Approve/reject appointments
- ✅ Auto-generate Google Meet links
- ✅ Manage services
- ✅ Configure working hours/schedule
- ✅ Manage shop items
- ✅ View payments
- ✅ User management
- ✅ Audit logs
- ✅ Reschedule appointments (1hr notice)
- ✅ Calendar view

---

## 🛠️ Database Management

### Quick Reference

```bash
cd database

# Complete setup (first time)
npm run setup

# Individual commands
npm run migrate          # Run migrations
npm run migrate:status   # Check migration status
npm run seed            # Seed admin account
npm run seed:services   # Seed services
npm run seed:schedule   # Seed schedule
```

### Manual Database Commands

```bash
# Set password environment variable first
$env:PGPASSWORD='admin'  # Windows PowerShell
# export PGPASSWORD='admin'  # Linux/Mac

# Connect to database
psql -U admin -d nuwendo_db

# Run migrations manually
psql -U admin -d nuwendo_db -f migrations/001_create_users_table.sql

# Run seeds manually
psql -U admin -d nuwendo_db -f seed.sql
psql -U admin -d nuwendo_db -f seed-services.sql
psql -U admin -d nuwendo_db -f seed-schedule.sql
```

### Reset Admin Password

If you forget the admin password:

```bash
cd backend
node fix-admin.js
```

This will reset the admin password to `jalaka09`.

---

## 🚨 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
# Windows:
Get-Service postgresql*

# Linux/Mac:
sudo systemctl status postgresql
```

### Port Already in Use

```bash
# Backend (Port 5000)
# Windows:
netstat -ano | findstr :5000

# Frontend (Port 5173)
# Windows:
netstat -ano | findstr :5173
```

### Migration Errors

```bash
# Check migration status
cd database
npm run migrate:status

# Rollback last migration
npm run migrate:down

# Re-run migrations
npm run migrate
```

### Admin Login Not Working

1. Verify credentials:
   - Email: `nuwendomc@gmail.com`
   - Password: `jalaka09`

2. Reset password if needed:
   ```bash
   cd backend
   node fix-admin.js
   ```

3. Check database:
   ```bash
   psql -U admin -d nuwendo_db
   SELECT email FROM admin_users;
   ```

---

## 📝 Development

### Adding New Migrations

```bash
cd database/migrations

# Create new migration file
# Format: XXX_description.sql
# Example: 022_add_new_feature.sql
```

### Database Schema

The application uses 21 migrations covering:
- User authentication
- Patient profiles
- Service management
- Booking system
- Payment tracking
- Admin system
- Working hours
- System settings
- Reschedule functionality

---

## 🌐 Production Deployment

### Environment Variables

Update these in production:

```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
DB_PASSWORD=<strong-database-password>
EMAIL_USER=<production-email>
EMAIL_PASS=<production-email-password>
```

### Admin Credentials

⚠️ **CRITICAL:** Change admin password immediately:

```bash
cd backend
node fix-admin.js
# Then update with your production password
```

---

## 📄 License

Private - Nuwendo Metabolic Clinic

---

## 🆘 Support

For issues or questions:
1. Check troubleshooting section
2. Review database logs
3. Contact development team

---

**Last Updated:** February 19, 2026

### 3. Configure Environment

Copy the `.env` file in the backend folder and update with your database credentials.

### 4. Run the Application

#### Development Mode

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```
Server will run on: http://localhost:5000

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:5173

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Tech Stack

### Frontend
- React 19
- Vite
- ESLint

### Backend
- Node.js
- Express
- CORS
- dotenv

### Database
- PostgreSQL

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

ISC
