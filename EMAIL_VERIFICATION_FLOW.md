# Email Verification Sign-Up Flow

## 🔐 New Registration Process

### Flow Overview
1. **Step 1: Email Input** → User enters email
2. **Step 2: Verify Code** → User receives 6-digit code via email and enters it
3. **Step 3: Setup Password** → User creates password and enters name
4. **Step 4: Complete** → User is registered and redirected to dashboard

---

## 📧 Step-by-Step Process

### **Step 1: Sign Up Page** (`/signup`)
- User enters their email address
- Click "Continue"
- Backend sends 6-digit verification code to email
- Code expires in 10 minutes
- User is redirected to verification page

**API Endpoint:** `POST /api/auth/send-code`
```json
{
  "email": "user@example.com"
}
```

### **Step 2: Verify Code Page** (`/verify-code`)
- User enters the 6-digit code from their email
- Timer shows code expiration countdown (10 minutes)
- Option to resend code if not received
- After successful verification, redirected to password setup

**Features:**
- ✅ Auto-formatted input (numbers only, max 6 digits)
- ✅ Countdown timer
- ✅ Resend code button
- ✅ Back to sign up link

**API Endpoint:** `POST /api/auth/verify-code`
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### **Step 3: Setup Password Page** (`/setup-password`)
- User enters first name and last name
- User creates password (minimum 6 characters)
- Password strength indicator
- Confirm password field with match validation
- Show/hide password toggle

**Features:**
- ✅ Password strength meter (Weak/Medium/Strong)
- ✅ Real-time password match validation
- ✅ Show/hide password toggles
- ✅ Visual feedback for all inputs

**API Endpoint:** `POST /api/auth/complete-registration`
```json
{
  "email": "user@example.com",
  "code": "123456",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

### **Step 4: Dashboard** (`/dashboard`)
- User is automatically logged in with JWT token
- Redirected to patient dashboard
- Token stored in localStorage

---

## 🗄️ Database Changes

### Users Table Updates
Added columns for verification:
- `verification_code` - 6-digit code (VARCHAR(6))
- `verification_code_expires` - Expiration timestamp
- `is_verified` - Email verification status (set to TRUE after completion)

---

## 📨 Email Service

### Development Mode
- Emails are logged to **console** instead of sending
- Verification code appears in backend terminal
- Perfect for testing without email configuration

### Console Output Example:
```
📧 ===== VERIFICATION EMAIL =====
To: user@example.com
Verification Code: 123456
================================
```

### Production Mode (Optional)
To actually send emails, configure in `.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@nowendo.com
```

---

## 🎨 Frontend Pages

### 1. **SignUp** (`/signup`)
- Simple email-only form
- Clean, modern design
- Loading states
- Error handling

### 2. **VerifyCode** (`/verify-code`)
- Large centered code input
- Real-time countdown timer
- Resend functionality
- Email display with icon

### 3. **SetupPassword** (`/setup-password`)
- Name fields (First & Last)
- Password with strength indicator
- Confirm password with match validation
- Multiple password visibility toggles

---

## 🔌 API Endpoints

### Registration Flow
1. `POST /api/auth/send-code` - Send verification code
2. `POST /api/auth/verify-code` - Verify the code
3. `POST /api/auth/complete-registration` - Complete with password

### Authentication
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/profile` - Get user profile (protected)

---

## 🛡️ Security Features

### Code Security
- ✅ 6-digit random code (100,000 - 999,999)
- ✅ 10-minute expiration
- ✅ One-time use (cleared after successful registration)
- ✅ Stored with expiration timestamp

### Password Security
- ✅ Minimum 6 characters
- ✅ Hashed with bcrypt (10 rounds)
- ✅ Strength indicator
- ✅ Confirmation required

### Token Security
- ✅ JWT with 7-day expiration
- ✅ Stored in localStorage
- ✅ Sent in Authorization header
- ✅ Verified on protected routes

---

## 🧪 Testing the Flow

### Quick Test:
1. Go to `http://localhost:5173/signup`
2. Enter email: `test@example.com`
3. Click "Continue"
4. Check **backend console** for verification code
5. Enter the code on verification page
6. Create password and enter name
7. Automatically logged in to dashboard

### Backend Console Output:
```
📧 ===== VERIFICATION EMAIL =====
To: test@example.com
Verification Code: 654321
================================
```

---

## 📱 User Experience

### Success Flow:
```
/signup 
  → Enter email 
  → Click "Continue"
  ↓
/verify-code 
  → Check email for code
  → Enter 6-digit code
  → Click "Verify Code"
  ↓
/setup-password
  → Enter name
  → Create password
  → Confirm password
  → Click "Complete Registration"
  ↓
/dashboard
  → Automatically logged in!
```

### Error Handling:
- ✅ Invalid email format
- ✅ User already exists
- ✅ Invalid/expired code
- ✅ Password mismatch
- ✅ Network errors
- ✅ All errors shown with friendly messages

---

## ⚙️ Configuration

### Environment Variables (`.env`)
```env
# Email (optional - for dev, logs to console)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@nowendo.com

# Database
DB_NAME=nuwendo_db
DB_USER=postgres
DB_PASSWORD=nuwendopassword

# JWT
JWT_SECRET=nuwendo_super_secret_jwt_key_change_in_production_2026
```

---

## 🚀 Production Checklist

Before deploying:
- [ ] Configure real email service (SendGrid, Mailgun, AWS SES)
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set proper CORS origins
- [ ] Configure rate limiting for code sending
- [ ] Add email verification IP throttling
- [ ] Monitor code generation/verification attempts
- [ ] Set up email delivery monitoring

---

## 💡 Features

### Current:
✅ Email verification with OTP
✅ 10-minute code expiration
✅ Resend code functionality  
✅ Password strength indicator
✅ Real-time validation
✅ Responsive design
✅ Loading states
✅ Error handling

### Future Enhancements:
- ⏳ SMS verification option
- ⏳ Social login (Google, Facebook)
- ⏳ Remember device
- ⏳ 2FA for login
- ⏳ Password reset via email

---

## 🔄 Migration Applied

Database migration `003_add_verification_code.sql` has been applied:
- Added `verification_code` column
- Added `verification_code_expires` column
- Created index on verification_code
- Ready for production use

---

## 📊 Current Status

✅ **FULLY FUNCTIONAL**
- All 3 pages created
- Backend API complete
- Email service configured (dev mode)
- Database migrated
- Routes configured
- No errors in compilation
- Ready to test!

**Test it now:** http://localhost:5173/signup
