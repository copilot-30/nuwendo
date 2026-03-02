# 🚀 Deployment Quick Start

Follow this checklist to deploy your Nuwendo app to Railway (backend) and Vercel (frontend).

## Prerequisites

- [ ] GitHub account with your code pushed
- [ ] Railway account ([Sign up](https://railway.app/))
- [ ] Vercel account ([Sign up](https://vercel.com/))
- [ ] Gmail account for email sending (or other SMTP provider)

## Part 1: Railway Backend Deployment

### 1. Create Railway Project

- [ ] Go to [Railway](https://railway.app/) and click "New Project"
- [ ] Choose "Deploy from GitHub repo"
- [ ] Select your repository
- [ ] Railway will auto-detect and deploy from root (configured via `railway.toml`)

### 2. Add PostgreSQL Database

- [ ] In your Railway project, click "+ New"
- [ ] Select "Database" → "PostgreSQL"
- [ ] Wait for provisioning to complete

### 3. Generate JWT Secret

Run this command locally to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output - you'll need it in the next step.

### 4. Set Environment Variables

Go to your backend service → Variables, and add these (see `backend/.env.production.example` for reference):

**Required Variables:**
```bash
PORT=5000
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<paste-your-generated-secret-here>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-specific-password
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

**Note:** We'll update `CORS_ORIGIN` and `FRONTEND_URL` after deploying the frontend.

### 5. Get Your Railway URL

- [ ] Wait for deployment to complete
- [ ] Copy your Railway URL (e.g., `https://your-app.up.railway.app`)
- [ ] Test health endpoint: `https://your-app.up.railway.app/api/health`

### 6. Run Database Migrations

**Option A: Via Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway link
railway run node backend/database/setup.js
```

**Option B: Via Railway Shell**
- Open your service in Railway dashboard
- Go to Settings → "Open Shell"
- Run: `cd backend && node database/setup.js`

## Part 2: Vercel Frontend Deployment

### 1. Create Vercel Project

- [ ] Go to [Vercel](https://vercel.com/) and click "New Project"
- [ ] Import your GitHub repository
- [ ] Vercel will auto-detect settings

### 2. Configure Project Settings

Verify these settings (should auto-detect):
- [ ] **Framework Preset:** Vite
- [ ] **Root Directory:** `frontend`
- [ ] **Build Command:** `npm run build`
- [ ] **Output Directory:** `dist`

### 3. Add Environment Variables

In Vercel project → Settings → Environment Variables, add:

```bash
# Use your Railway URL from Part 1, Step 5
VITE_API_URL=https://your-railway-app.up.railway.app

# Vercel will provide this URL after deployment
# For now, use a placeholder or leave as localhost
VITE_APP_URL=https://your-frontend-app.vercel.app
```

### 4. Deploy

- [ ] Click "Deploy"
- [ ] Wait for build to complete (~2-3 minutes)
- [ ] Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

### 5. Update After First Deployment

After getting your Vercel URL:
- [ ] Go to Vercel → Settings → Environment Variables
- [ ] Update `VITE_APP_URL` to your actual Vercel URL
- [ ] Redeploy (Vercel → Deployments → Click "⋯" → Redeploy)

## Part 3: Connect Frontend & Backend

### Update Railway CORS Settings

Go back to Railway → Backend service → Variables:

- [ ] Update `CORS_ORIGIN`:
```bash
CORS_ORIGIN=https://your-app.vercel.app,https://your-app-*.vercel.app
```

- [ ] Update `FRONTEND_URL`:
```bash
FRONTEND_URL=https://your-app.vercel.app
```

- [ ] Redeploy backend service (Railway → Redeploy)

## Part 4: Test Your Deployment

### Backend Tests
- [ ] Visit: `https://your-railway-app.up.railway.app/api/health`
  - Should return: `{"status": "OK", "database": "Connected"}`

### Frontend Tests
- [ ] Visit: `https://your-app.vercel.app`
- [ ] Application loads without errors
- [ ] Open browser console (F12) - no errors

### Full Flow Test
- [ ] Register a new user account
- [ ] Check email for verification code
- [ ] Login with credentials
- [ ] Create a test booking (if applicable)
- [ ] Verify data persists after page refresh

## 🎉 Success!

Your application is now deployed! Here are your URLs:

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-railway-app.up.railway.app`
- **API Health:** `https://your-railway-app.up.railway.app/api/health`

## Optional: Custom Domain Setup

Want to use your own domain like `nuwendo.dev`?

See the "Part 3: Configure Custom Domain" section in [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Troubleshooting Quick Fixes

### "CORS Error" in Browser Console
→ Update `CORS_ORIGIN` in Railway to include your Vercel URL

### "Failed to fetch" or "Network Error"
→ Verify `VITE_API_URL` in Vercel matches your Railway URL

### Backend "Database connection failed"
→ Check Railway PostgreSQL service is running and `DATABASE_URL` is set

### Environment variables not working
→ Frontend: Must start with `VITE_` prefix
→ Backend: Check Railway Variables tab
→ Both: Redeploy after changes

### "No start command found" error
→ Ensure `railway.toml` exists in project root
→ Verify `package.json` has `"start": "cd backend && npm start"`

## 📚 Need More Help?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Detailed step-by-step instructions
- Advanced configuration options
- Custom domain setup
- Monitoring and maintenance
- Security best practices
- Cost estimates

---

**Quick Support Links:**
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Project README](./README.md)
