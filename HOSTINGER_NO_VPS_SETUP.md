# Nuwendo No‑VPS Deployment Guide

This setup keeps your existing WordPress site untouched and deploys the web app separately.

## Target architecture

- **WordPress (existing):** `https://nuwendo.com`
- **Frontend (React/Vite static):** `https://app.nuwendo.com`
- **Backend (Node/Express managed host):** `https://api.nuwendo.com`

---

## 1) Deploy backend to a managed Node host (Render/Railway-like/Koyeb/Fly)

Use your `backend` folder as the service root.

### Required service settings

- Runtime: Node.js
- Node version: **22** (fallback 20)
- Root directory: `backend`
- Build command:

```bash
npm ci
```

- Start command:

```bash
npm run start
```

### Backend environment variables

Set these in the provider dashboard (not from local machine):

```bash
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Use your real hosted Postgres URL
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME

JWT_SECRET=YOUR_NEW_STRONG_SECRET

FRONTEND_URL=https://app.nuwendo.com
CORS_ORIGIN=https://app.nuwendo.com,https://www.app.nuwendo.com,http://localhost:5173

RESEND_API_KEY=YOUR_RESEND_KEY
EMAIL_FROM=noreply@nuwendo.com

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=https://api.nuwendo.com/api/oauth/google/callback
```

### Verify backend

Open:

- `https://<your-backend-temp-url>/api/health`

Expect JSON with `status: OK`.

---

## 2) Point `api.nuwendo.com` to backend provider

In Hostinger DNS zone for `nuwendo.com`:

- Add **CNAME** `api` -> provider target domain (or **A** record if provider gives IP)

Wait for DNS propagation.

Verify:

- `https://api.nuwendo.com/api/health`

---

## 3) Build frontend locally

From project root:

```bash
cd frontend
npm ci
npm run build
```

Output folder will be `frontend/dist`.

---

## 4) Configure frontend env for production build

Create/update `frontend/.env.production`:

```bash
VITE_API_URL=https://api.nuwendo.com
VITE_APP_URL=https://app.nuwendo.com
```

Rebuild after updating env:

```bash
cd frontend
npm run build
```

---

## 5) Create subdomain in Hostinger for frontend

In Hostinger hPanel:

1. Create subdomain: `app.nuwendo.com`
2. Set document root for subdomain
3. Upload all contents of `frontend/dist` into that document root

---

## 6) SPA fallback (`index.html` rewrites)

For Vite React routing, ensure unknown paths route to `index.html`.

If Hostinger Apache hosting supports `.htaccess`, place this in frontend root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 7) Google OAuth setup

In Google Cloud Console -> OAuth Client:

### Authorized JavaScript origins

- `https://app.nuwendo.com`

### Authorized redirect URIs

- `https://api.nuwendo.com/api/oauth/google/callback`
- (optional local) `http://localhost:5000/api/oauth/google/callback`

---

## 8) Final smoke test checklist

- [ ] `https://api.nuwendo.com/api/health` works
- [ ] `https://app.nuwendo.com` loads
- [ ] Login send-code works
- [ ] Admin login works
- [ ] Cart checkout works
- [ ] Receipt upload works
- [ ] Google OAuth callback works

---

## 9) Keep localhost development working

### Backend local `.env`

```bash
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nuwendo_db
DB_USER=postgres
DB_PASSWORD=your_local_password
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback
```

### Frontend local `.env.local`

```bash
VITE_API_URL=http://localhost:5000
VITE_APP_URL=http://localhost:5173
```

---

## Security note (important)

If any secrets were exposed in chats/screenshots, rotate immediately:

- `JWT_SECRET`
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_SECRET`
- email app password
