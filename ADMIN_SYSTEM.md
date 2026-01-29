# Admin System Documentation

## 🔐 Admin Access

### Login Credentials
**URL:** http://localhost:5173/admin/login

**Default Admin Account:**
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** admin@nowendo.com
- **Role:** super_admin

### Security Features
- ✅ JWT-based authentication with 8-hour sessions
- ✅ Session tracking in database
- ✅ Role-based access control (admin, super_admin)
- ✅ Automatic session expiry
- ✅ Secure password hashing (bcrypt)

---

## 🏗️ Admin System Architecture

### Backend Components

#### Database Tables
1. **`admin_users`** - Admin accounts and profiles
2. **`admin_sessions`** - Active admin sessions with tokens
3. **`services`** - Healthcare services (with audit trail)
4. **`time_slots`** - Available appointment times (with audit trail)
5. **`bookings`** - Patient bookings

#### API Endpoints

**Admin Authentication** (`/api/admin/auth/`)
- `POST /login` - Admin login
- `GET /profile` - Get admin profile
- `POST /logout` - Admin logout  
- `GET /dashboard/stats` - Dashboard statistics

**Admin Management** (`/api/admin/`)
- `GET /services` - List all services
- `POST /services` - Create new service
- `PUT /services/:id` - Update service
- `DELETE /services/:id` - Delete service (super_admin only)
- `GET /time-slots` - List all time slots
- `POST /time-slots` - Create time slot
- `PUT /time-slots/:id` - Update time slot
- `DELETE /time-slots/:id` - Delete time slot (super_admin only)
- `GET /bookings` - List bookings with pagination
- `PATCH /bookings/:id/status` - Update booking status

#### Middleware
- **`adminAuth`** - JWT token verification + session validation
- **`requireRole`** - Role-based authorization

---

## 📊 Admin Dashboard Features

### Dashboard Overview (`/admin/dashboard`)
- **Total Bookings** - All-time appointment count
- **Today's Appointments** - Today's scheduled appointments  
- **This Week** - Appointments for current week
- **Monthly Revenue** - Revenue from paid bookings this month
- **Recent Bookings** - Latest 10 bookings with details
- **Quick Actions** - Navigation to management pages

### Real-time Statistics
- Live data from PostgreSQL database
- Automatic updates on page refresh
- Role-based data visibility

---

## 🏥 Services Management (`/admin/services`)

### Service CRUD Operations
- ✅ **Create** new healthcare services
- ✅ **Read** all services with pagination  
- ✅ **Update** existing services
- ✅ **Delete** services (if no bookings exist)
- ✅ **Toggle** service active/inactive status

### Service Fields
- **Name** - Service title (e.g., "General Consultation")
- **Description** - Detailed service description
- **Duration** - Appointment length in minutes (5-480)
- **Price** - Service cost in PHP
- **Category** - Service category (Consultation, Dental, etc.)
- **Status** - Active/Inactive for booking availability

### Categories Available
- Consultation
- Dental
- Ophthalmology
- Therapy
- Laboratory
- Mental Health
- Cardiology
- Dermatology
- Pediatrics
- Surgery

### Audit Trail
- Tracks who created each service
- Tracks who last updated each service
- Timestamps for all changes

---

## ⏰ Schedule Management (`/admin/schedule`)

### Time Slot Management
- ✅ **Create** new time slots by day of week
- ✅ **Update** existing time slots
- ✅ **Delete** unused time slots
- ✅ **Toggle** slot active/inactive status
- ✅ **Prevent overlapping** time slots

### Schedule Configuration
- **Days:** Monday - Saturday (Sunday excluded)
- **Time Format:** 24-hour (HH:MM)
- **Granularity:** Customizable start/end times
- **Validation:** Prevents overlapping slots
- **Status Control:** Enable/disable individual slots

### Default Schedule
Pre-configured with:
- **Monday - Friday:** 9:00 AM - 5:00 PM (hourly slots)
- **Saturday:** 9:00 AM - 12:00 PM (half day)
- **Sunday:** Closed

### Visual Schedule Grid
- Organized by day of the week
- Shows all time slots per day
- Quick enable/disable toggles
- Edit and delete actions
- Empty state guidance

---

## 👥 User Roles & Permissions

### Super Admin (`super_admin`)
- ✅ Full dashboard access
- ✅ Create/edit/delete services
- ✅ Create/edit/delete time slots
- ✅ View all bookings
- ✅ Update booking statuses
- ✅ Delete services with bookings (restricted)

### Admin (`admin`)
- ✅ Dashboard access (limited)
- ✅ Create/edit services
- ✅ Create/edit time slots  
- ✅ View bookings
- ✅ Update booking statuses
- ❌ Cannot delete services
- ❌ Cannot delete time slots

---

## 🔄 Booking Management

### Booking Status Flow
1. **Pending** - Initial booking state
2. **Confirmed** - Admin approved booking
3. **Completed** - Appointment finished
4. **Cancelled** - Booking cancelled

### Booking Information
- Patient details (name, email, phone)
- Service selected
- Appointment date & time
- Payment information
- Booking status
- Notes from patient

---

## 🛡️ Security Considerations

### Authentication
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 8-hour expiration
- Database session tracking
- Automatic logout on token expiry

### Authorization
- Role-based access control
- Protected API endpoints
- Session validation on each request
- Middleware enforcement

### Best Practices
- Regular password updates recommended
- Limited session duration
- Audit trails for all actions
- Role separation for security

---

## 🚀 Getting Started

### 1. Access Admin Portal
```
http://localhost:5173/admin/login
```

### 2. Login with Default Credentials
```
Username: admin
Password: admin123
```

### 3. First Steps
1. **Change default password** (recommended)
2. **Review services** - Update or add new services
3. **Configure schedule** - Set available time slots
4. **Test booking flow** - Verify patient booking works
5. **Monitor dashboard** - Check booking statistics

### 4. Regular Admin Tasks
- Review new bookings daily
- Update booking statuses
- Manage service availability
- Adjust schedule as needed
- Monitor system statistics

---

## 📱 Admin Mobile Support

### Responsive Design
- ✅ Mobile-friendly admin interface
- ✅ Touch-optimized controls
- ✅ Responsive data tables
- ✅ Mobile navigation

---

## ⚡ Performance Features

### Optimizations
- Efficient database queries
- Pagination for large datasets
- Minimal API calls
- Cached session validation
- Optimistic UI updates

---

## 🔧 Troubleshooting

### Common Issues

**Cannot login:**
- Check username/password
- Verify admin account is active
- Check backend server is running

**Session expired:**
- Re-login to admin portal
- Check JWT token validity
- Verify admin_sessions table

**Permission denied:**
- Check user role permissions
- Verify JWT token contains correct role
- Contact super admin for role update

**API errors:**
- Check backend server status
- Verify database connection
- Review server logs for errors

---

## 📈 Future Enhancements

### Planned Features
- Advanced analytics dashboard
- Email notifications for bookings
- Calendar integration
- Bulk operations
- Advanced reporting
- User activity logs
- Password reset functionality
- Multi-language support

---

## 🎯 Admin Workflow

### Daily Operations
1. **Morning:** Review overnight bookings
2. **Check:** Today's appointment schedule
3. **Update:** Booking statuses as needed
4. **Monitor:** Dashboard statistics
5. **Manage:** Service availability

### Weekly Tasks
- Review weekly booking trends
- Update service offerings
- Adjust schedule availability
- Generate reports

### Monthly Activities
- Analyze revenue reports
- Review system performance
- Update admin accounts
- Plan service improvements

---

**Admin System Ready! 🎉**

The complete admin system is now operational with full CRUD capabilities for services, schedule management, booking oversight, and comprehensive dashboard analytics.

**Quick Links:**
- 🔐 Admin Login: http://localhost:5173/admin/login
- 📊 Dashboard: http://localhost:5173/admin/dashboard
- 🏥 Services: http://localhost:5173/admin/services
- ⏰ Schedule: http://localhost:5173/admin/schedule