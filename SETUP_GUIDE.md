# 🚀 Nuwendo Setup Guide - Fresh Clone

Complete step-by-step guide to set up Nuwendo on a fresh device.

## ⏱️ Time Required: 5-10 minutes

---

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd nowendo
```

---

## Step 2: Install All Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..

# Install database dependencies
cd database
npm install
cd ..
```

---

## Step 3: Create PostgreSQL Database

### Option A: Using createdb (Recommended)
```bash
createdb -U postgres nuwendo_db
```

### Option B: Using psql
```bash
psql -U postgres
CREATE DATABASE nuwendo_db;
\q
```

---

## Step 4: Setup Database (ONE COMMAND!)

```bash
cd database

# Windows PowerShell
$env:PGPASSWORD='admin'
npm run setup

# Linux/Mac
export PGPASSWORD='admin'
npm run setup
```

This single command will:
- ✅ Run 21 migrations
- ✅ Create admin account
- ✅ Seed 5 services
- ✅ Seed working schedule

**Output should show:**
```
🗄️  DATABASE SETUP STARTING...

📋 Step 1: Running migrations...
✓ Completed 21 migrations

👤 Step 2: Creating admin account...
✓ Admin created

💼 Step 3: Seeding services...
✓ 5 services added

📅 Step 4: Seeding schedule...
✓ Schedule configured

✅ DATABASE SETUP COMPLETE!

Admin Login Credentials:
  Email:    nuwendomc@gmail.com
  Password: jalaka09
```

---

## Step 5: Configure Backend Environment

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
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Google OAuth (Optional - for Google Meet links)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback
```

**Note:** Email is required for patient verification codes.

---

## Step 6: Start the Application

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

**Should show:**
```
✓ Connected to PostgreSQL database
🚀 Server is running on http://localhost:5000
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

**Should show:**
```
VITE v7.3.1  ready in 200ms

➜  Local:   http://localhost:5173/
```

---

## Step 7: Verify Everything Works

### Test Admin Login
1. Open: http://localhost:5173/login
2. Enter: `nuwendomc@gmail.com`
3. Should see: **Password field** (not verification code)
4. Enter: `jalaka09`
5. Should redirect to: Admin Dashboard ✅

### Test Patient Signup
1. Open: http://localhost:5173/signup
2. Enter your email
3. Check email for 6-digit code
4. Complete signup flow

---

## ✅ Setup Complete!

Your application is now running:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Admin Panel:** http://localhost:5173/login

### Default Credentials:
- **Email:** nuwendomc@gmail.com
- **Password:** jalaka09

⚠️ **Remember to change the password in production!**

---

## 🔧 Troubleshooting

### "Database does not exist"
```bash
createdb -U postgres nuwendo_db
```

### "Password authentication failed"
Update `backend/.env` with correct PostgreSQL password

### "Port 5000 already in use"
Kill the process using port 5000 or change PORT in `.env`

### "Port 5173 already in use"
Kill the process or Vite will automatically use next available port

### Reset Admin Password
```bash
cd backend
node fix-admin.js
```

---

## 📚 Next Steps

1. **Configure Email** (backend/.env) for verification codes
2. **Set up Google OAuth** (optional) for Google Meet links
3. **Review Services** in admin panel
4. **Adjust Schedule** in admin schedule settings
5. **Test Booking Flow** as a patient

---

## 🆘 Need Help?

1. Check [README.md](README.md) for detailed documentation
2. Check [database/README.md](database/README.md) for database info
3. Review [AUTH_FIX_SUMMARY.md](AUTH_FIX_SUMMARY.md) for auth details

---

**Setup Date:** February 19, 2026
