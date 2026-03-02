# Deployment Guide for Nuwendo

This guide will walk you through deploying the Nuwendo application using Railway (backend) and Vercel (frontend).

## Prerequisites

- [Railway Account](https://railway.app/) (for backend + PostgreSQL)
- [Vercel Account](https://vercel.com/) (for frontend)
- Git repository hosted on GitHub (recommended)

## Part 1: Deploy Backend to Railway

### Step 1: Create a New Railway Project

1. Go to [Railway](https://railway.app/) and sign in
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository

**Note:** The project is configured via `railway.toml` at the root to automatically build and run the backend. No manual directory configuration needed.

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provision a PostgreSQL instance

### Step 3: Configure Environment Variables

Go to your backend service settings → Variables, and add the following:

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration (Railway provides DATABASE_URL automatically)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secret (generate a strong random string - REQUIRED!)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# CORS Origins (your Vercel frontend URL - update after frontend deployment)
CORS_ORIGIN=https://your-app.vercel.app

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-railway-app.up.railway.app/api/oauth/google/callback

# Frontend URL (your Vercel URL - update after frontend deployment)
FRONTEND_URL=https://your-app.vercel.app
```

### Step 4: Deploy

1. Railway will automatically start deploying after you connect your repo
2. Monitor the build logs in the Railway dashboard
3. Once deployed, you'll get a URL like `https://your-app.up.railway.app`

### Step 5: Run Database Migrations

After successful deployment:

1. In Railway, go to your backend service
2. Navigate to the "Settings" tab → "Build & Deploy"
3. Use the CLI or add this as a one-time startup command:

**Option A: Via Railway CLI**
```bash
railway login
railway link
railway run node backend/database/setup.js
```

**Option B: Via Service Variables**
Add a one-time initialization (then remove after first run):
- In Settings, temporarily add a custom start command
- Or connect via the Railway shell and run manually

### Step 6: Verify Deployment

Visit your Railway URL + `/api/health`:
```
https://your-railway-app.up.railway.app/api/health
```

You should see a JSON response indicating the server is running and database is connected.

## Part 2: Deploy Frontend to Vercel

### Step 1: Connect Your Repository

1. Go to [Vercel](https://vercel.com/) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Vite project

### Step 2: Configure Build Settings

Set the following in Vercel:

- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 3: Add Environment Variables

In your Vercel project settings → Environment Variables, add:

```bash
# Backend API URL (from Railway - get this from Part 1, Step 4)
VITE_API_URL=https://your-railway-app.up.railway.app

# Frontend App URL (will be provided by Vercel after deployment)
# You can update this after first deployment
VITE_APP_URL=https://your-app.vercel.app
```

**Important:** Make sure to set these for all environments (Production, Preview, Development) if needed.

### Step 4: Deploy

1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. You'll get a URL like `https://your-app.vercel.app`

### Step 5: Update Backend CORS

After getting your Vercel URL, go back to Railway and update the environment variables:

```bash
CORS_ORIGIN=https://your-app.vercel.app,https://your-app-*.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```

**Note:** The wildcard `https://your-app-*.vercel.app` allows preview deployments to work.

Trigger a redeploy of the backend service for changes to take effect.

## Part 3: Configure Custom Domain (Optional)

### For Vercel (Frontend)

1. Go to your Vercel project → Settings → Domains
2. Add your custom domain (e.g., `nuwendo.dev`)
3. Follow Vercel's DNS configuration instructions
4. Add both `nuwendo.dev` and `www.nuwendo.dev` if desired

### For Railway (Backend)

1. Go to your Railway service → Settings → Networking
2. Click "Add Custom Domain"
3. Add your API subdomain (e.g., `api.nuwendo.dev`)
4. Update your DNS with the provided CNAME record

### Update Environment Variables After Custom Domains

**Railway (Backend):**
```bash
CORS_ORIGIN=https://nuwendo.dev,https://www.nuwendo.dev
FRONTEND_URL=https://nuwendo.dev
GOOGLE_REDIRECT_URI=https://api.nuwendo.dev/api/oauth/google/callback
```

**Vercel (Frontend):**
```bash
VITE_API_URL=https://api.nuwendo.dev
VITE_APP_URL=https://nuwendo.dev
```

## Testing Your Deployment

1. **Health Check:** Visit `https://your-railway-app.up.railway.app/api/health`
   - Should return: `{"status": "OK", "database": "Connected"}`

2. **Frontend:** Visit `https://your-app.vercel.app`
   - Should load the application

3. **User Flow:** Try registering a new account
   - Check browser console for errors
   - Verify email sending works
   - Test login functionality

4. **Database:** Verify data persists
   - Create a booking or user
   - Refresh the page
   - Data should still be there

## Troubleshooting

### Backend Issues

**"No start command was found"**
- The `railway.toml` file should handle this automatically
- Verify it exists in your project root
- Check Railway build logs for errors

**Database Connection Failed**
- Ensure PostgreSQL service is running in Railway
- Verify `DATABASE_URL` environment variable is set
- Check Railway logs for connection errors

**CORS Errors**
- Update `CORS_ORIGIN` to include your Vercel URL
- Include preview deployment URLs with wildcard: `https://your-app-*.vercel.app`
- Redeploy backend after updating

**500 Internal Server Errors**
- Check Railway logs for detailed error messages
- Verify all required environment variables are set
- Ensure JWT_SECRET is at least 32 characters

### Frontend Issues

**API Connection Failed**
- Verify `VITE_API_URL` in Vercel environment variables
- Ensure it points to your Railway backend URL
- Check if Railway backend is running

**Blank Page / Build Errors**
- Check Vercel deployment logs
- Verify all dependencies are in package.json
- Ensure TypeScript compilation succeeds

**Environment Variables Not Working**
- Must start with `VITE_` prefix for Vite
- Set in Vercel dashboard, not in .env file
- Redeploy after changing environment variables

**404 on Page Refresh**
- Ensure `vercel.json` includes rewrite rules for SPA routing
- File should already be created with proper configuration

### Database Issues

**Migrations Not Running**
- Run migrations manually via Railway CLI
- Or use Railway shell to execute: `node backend/database/setup.js`
- Check database permissions

**Tables Not Created**
- Ensure migrations ran successfully
- Check Railway PostgreSQL logs
- Verify database user has CREATE permissions

## Monitoring & Maintenance

### Railway Monitoring

- View logs in real-time: Railway Dashboard → Service → Logs
- Set up alerts for downtime
- Monitor database usage and storage

### Vercel Monitoring

- View deployment logs: Vercel Dashboard → Project → Deployments
- Monitor bandwidth usage
- Check function execution time (if using serverless functions)

### Database Backups

Railway provides automated backups for PostgreSQL:
- Go to PostgreSQL service → Backups
- Configure backup retention
- Test restoration process

## Continuous Deployment

Both platforms support automatic deployments:

- **Railway:** Auto-deploys on push to main/master branch
- **Vercel:** Auto-deploys on push to main/master branch
- **Preview Deployments:** Both create preview deployments for pull requests

Configure branch deployments in each platform's settings.

## Security Best Practices

- [ ] Use strong JWT_SECRET (min 32 characters, random)
- [ ] Never commit `.env` files to git
- [ ] Use environment-specific credentials
- [ ] Enable HTTPS for all domains (automatic on Railway & Vercel)
- [ ] Restrict CORS to specific domains (not wildcard `*`)
- [ ] Set up proper OAuth redirect URIs
- [ ] Use app-specific passwords for email (not main password)
- [ ] Enable 2FA on Railway and Vercel accounts
- [ ] Review and rotate secrets regularly
- [ ] Set up database connection limits
- [ ] Enable Railway/Vercel security features
- [ ] Keep dependencies updated

## Cost Estimates

### Railway
- **Starter Plan:** $5/month credit (free tier)
- **Usage-based:** ~$0.000463/minute (~$20/month for 24/7)
- **PostgreSQL:** Included in usage
- **Bandwidth:** 100GB included

### Vercel
- **Hobby Plan:** Free
  - 100GB bandwidth/month
  - 6,000 build minutes/month
  - Serverless function execution
- **Pro Plan:** $20/month (for commercial projects)

### Total Estimate
- **Development/Small Projects:** Can run entirely on free tiers
- **Production:** ~$20-30/month (Railway Starter + possible overages)

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Need Help?

For issues specific to:
- **Railway:** [Railway Discord](https://discord.gg/railway) or [Railway Help](https://help.railway.app/)
- **Vercel:** [Vercel Support](https://vercel.com/support) or [Vercel Discord](https://vercel.com/discord)
- **This Project:** Check your Railway and Vercel logs first, then review this guide

---

**Last Updated:** March 2026
