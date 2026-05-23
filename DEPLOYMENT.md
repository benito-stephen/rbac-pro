# RBAC PRO — Complete Deployment Guide

This guide walks you through deploying the **entire RBAC PRO stack** to the cloud so anyone can access it via a public URL (for demos, assignments, or production).

---

## Table of contents

1. [Architecture overview](#1-architecture-overview)
2. [What you need before starting](#2-what-you-need-before-starting)
3. [Step 1 — MongoDB Atlas (database)](#3-step-1--mongodb-atlas-database)
4. [Step 2 — Render (backend API)](#4-step-2--render-backend-api)
5. [Step 3 — Vercel (frontend)](#5-step-3--vercel-frontend)
6. [Step 4 — Connect frontend and backend (CORS)](#6-step-4--connect-frontend-and-backend-cors)
7. [Step 5 — Seed demo users](#7-step-5--seed-demo-users)
8. [Step 6 — Verify everything works](#8-step-6--verify-everything-works)
9. [Environment variables reference](#9-environment-variables-reference)
10. [Updating after code changes](#10-updating-after-code-changes)
11. [Troubleshooting (detailed)](#11-troubleshooting-detailed)
12. [Alternative hosting options](#12-alternative-hosting-options)
13. [Security checklist for production](#13-security-checklist-for-production)

---

## 1. Architecture overview

Your app has **three separate parts**. Each runs on its own service:

```mermaid
flowchart LR
  subgraph users [Users]
    Browser[Web browser]
  end

  subgraph vercel [Vercel - Frontend]
    SPA[React SPA / Vite build]
  end

  subgraph render [Render - Backend]
    API[Node.js + Express API]
  end

  subgraph atlas [MongoDB Atlas]
    DB[(rbac_pro database)]
  end

  Browser --> SPA
  SPA -->|HTTPS /api/*| API
  API --> DB
```

| Layer | Technology | Host | Public URL example |
|-------|------------|------|-------------------|
| **Frontend** | React + Vite | Vercel | `https://rbac-pro.vercel.app` |
| **Backend** | Node.js + Express | Render | `https://rbac-pro-api.onrender.com` |
| **Database** | MongoDB | MongoDB Atlas | (private connection string only) |

**How requests flow:**

1. User opens your Vercel URL in the browser.
2. The React app loads static files from Vercel.
3. When the user logs in, the browser sends `POST https://YOUR-API.onrender.com/api/auth/login`.
4. The API validates credentials against MongoDB Atlas and returns a JWT.
5. All later API calls include `Authorization: Bearer <token>`.

**Important:** The frontend and backend are on **different domains**. You must configure **CORS** on the API (`CLIENT_URL`) and point the frontend at the API (`VITE_API_URL`).

---

## 2. What you need before starting

### Accounts (all have free tiers)

| Service | Sign up | Purpose |
|---------|---------|---------|
| [GitHub](https://github.com) | Already have repo | Source code |
| [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) | Free M0 cluster | Database |
| [Render](https://render.com) | Free web service | Backend API |
| [Vercel](https://vercel.com) | Free hobby plan | Frontend |

### Repository

Your code should be on GitHub:

- **Repo:** `https://github.com/benito-stephen/rbac-pro`
- **Branch to deploy:** `main` (recommended)

### Local check (optional but helpful)

Before deploying, confirm the app works locally:

```powershell
# Terminal 1 — MongoDB (Docker)
docker start rbac-mongo

# Terminal 2 — Backend
cd f:\avidus\backend
npm install
npm run dev
# Wait for: RBAC PRO API running on port 5000

# Terminal 3 — Frontend
cd f:\avidus\frontend
npm install
npm run dev
# Open the URL Vite prints (e.g. http://localhost:5173)
```

---

## 3. Step 1 — MongoDB Atlas (database)

Atlas hosts your MongoDB database in the cloud. Render cannot use a database on your laptop.

### 3.1 Create a project and cluster

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign in (or create an account).
2. Click **Build a Database**.
3. Choose **M0 FREE** (Shared, free forever tier).
4. Pick a cloud provider and region **close to your Render region** (e.g. AWS `us-east-1` if Render is US).
5. Cluster name: default `Cluster0` is fine.
6. Click **Create**.

### 3.2 Create a database user

1. Left menu → **Database Access** → **Add New Database User**.
2. Authentication: **Password**.
3. Username: e.g. `rbacpro_admin`.
4. Password: click **Autogenerate Secure Password** and **save it somewhere safe** (you need it for the connection string).
5. Database User Privileges: **Atlas admin** or **Read and write to any database** (for a school project).
6. Click **Add User**.

### 3.3 Allow network access

Render’s servers need to reach Atlas from the internet.

1. Left menu → **Network Access** → **Add IP Address**.
2. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`).
   - For a school/demo project this is acceptable.
   - For real production, restrict to Render’s outbound IPs if documented.
3. Click **Confirm**.

### 3.4 Get the connection string

1. Left menu → **Database** → click **Connect** on your cluster.
2. Choose **Drivers**.
3. Driver: **Node.js**, version 5.5 or later.
4. Copy the connection string. It looks like:

   ```
   mongodb+srv://rbacpro_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. Edit the string:
   - Replace `<password>` with your actual password (URL-encode special characters if needed, e.g. `@` → `%40`).
   - Add a database name before `?`:

   ```
   mongodb+srv://rbacpro_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rbac_pro?retryWrites=true&w=majority
   ```

6. Save this as **`MONGODB_URI`** — you will paste it into Render.

### 3.5 Test connection (optional)

In Atlas → **Database** → **Browse Collections**, after seeding you should see collections like `users`, `tasks`, `auditlogs`.

---

## 4. Step 2 — Render (backend API)

Render runs your Express server 24/7 (with limitations on the free tier).

### 4.1 Connect GitHub

1. Go to [https://dashboard.render.com](https://dashboard.render.com).
2. Sign up / log in with **GitHub**.
3. Authorize Render to access your repositories.

### 4.2 Create the web service (manual — recommended for learning)

1. Click **New +** → **Web Service**.
2. Connect repository: **`benito-stephen/rbac-pro`** (or your fork).
3. Configure:

   | Field | Value |
   |-------|--------|
   | **Name** | `rbac-pro-api` (or any name) |
   | **Region** | Same region as Atlas if possible |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free |

4. Expand **Advanced** → set **Health Check Path**: `/api/health`

### 4.3 Environment variables (Render)

Scroll to **Environment Variables** and add each row:

| Key | Value | Notes |
|-----|--------|------|
| `NODE_ENV` | `production` | Enables secure cookies, etc. |
| `PORT` | `5000` | Render maps this to HTTPS externally |
| `MONGODB_URI` | Your Atlas connection string | From step 3.4 |
| `JWT_ACCESS_SECRET` | Long random string | e.g. 64+ chars; [random.org](https://www.random.org/strings/) |
| `JWT_REFRESH_SECRET` | Different long random string | Must not match access secret |
| `JWT_ACCESS_EXPIRES` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES` | `7d` | Refresh token lifetime |
| `CLIENT_URL` | `http://localhost:5173` | **Temporary** — update after Vercel deploy |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15 minutes |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `LOG_LEVEL` | `info` | Logging level |

**Generate JWT secrets (PowerShell example):**

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```

Run twice for two different secrets.

### 4.4 Deploy

1. Click **Create Web Service**.
2. Wait for build logs: `npm install` → `node server.js`.
3. Success looks like: `MongoDB connected` and `RBAC PRO API running on port 5000`.
4. Copy your public URL, e.g. **`https://rbac-pro-api.onrender.com`**.

### 4.5 Test the API alone

Open in a browser or use curl:

```
https://YOUR-SERVICE.onrender.com/api/health
```

Expected JSON:

```json
{
  "success": true,
  "message": "RBAC PRO API is healthy",
  "data": { "timestamp": "..." }
}
```

**Free tier note:** After ~15 minutes of no traffic, Render **spins down** the service. The first request may take **30–60 seconds** to wake it up. This is normal.

### 4.6 Option B — Blueprint deploy (`render.yaml`)

If you prefer infrastructure-as-code:

1. **New +** → **Blueprint**.
2. Select repo `rbac-pro`.
3. Render reads `render.yaml` at the repo root.
4. When prompted, enter `MONGODB_URI` and `CLIENT_URL` manually.
5. JWT secrets can be auto-generated by the blueprint.

---

## 5. Step 3 — Vercel (frontend)

Vercel builds and hosts your React app as static files + CDN.

### 5.1 Import the project

1. Go to [https://vercel.com](https://vercel.com) and log in with **GitHub**.
2. Click **Add New…** → **Project**.
3. Import **`benito-stephen/rbac-pro`**.
4. Configure:

   | Field | Value |
   |-------|--------|
   | **Framework Preset** | Vite (auto-detected) |
   | **Root Directory** | Click **Edit** → set to `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` (default) |

### 5.2 Environment variables (Vercel)

Before deploying, add:

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://YOUR-RENDER-URL.onrender.com/api` |

**Example:**

```
VITE_API_URL=https://rbac-pro-api.onrender.com/api
```

Rules:

- Must include **`https://`**
- Must end with **`/api`** (not `/api/`)
- No trailing slash after `api`

**Why `/api`?** Your Express app mounts all routes under `/api` (see `backend/src/app.js`). The frontend axios client uses `baseURL: VITE_API_URL`, so login becomes `POST .../api/auth/login`.

### 5.3 Deploy

1. Click **Deploy**.
2. Wait for build (~1–2 minutes). You should see `vite build` succeed.
3. Vercel gives you a URL, e.g. **`https://rbac-pro.vercel.app`**.
4. Open it — you should see the landing page. Login will **not** work until step 6 (CORS).

### 5.4 SPA routing (`vercel.json`)

The repo includes `frontend/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This ensures routes like `/dashboard` and `/admin/users` work on refresh. No extra setup needed.

---

## 6. Step 4 — Connect frontend and backend (CORS)

The browser blocks requests from `https://your-app.vercel.app` to `https://your-api.onrender.com` unless the API explicitly allows that origin.

### 6.1 Update Render `CLIENT_URL`

1. Render dashboard → your **rbac-pro-api** service → **Environment**.
2. Edit **`CLIENT_URL`** to your **exact** Vercel URL:

   ```
   https://rbac-pro.vercel.app
   ```

3. Rules:
   - Use **`https`**, not `http`
   - **No trailing slash** at the end
   - Must match what appears in the browser address bar

4. **Multiple origins** (optional): comma-separated for local + production:

   ```
   http://localhost:5173,http://localhost:5174,https://rbac-pro.vercel.app
   ```

5. Click **Save Changes** → Render will **auto-redeploy** (or click **Manual Deploy** → **Deploy latest commit**).

### 6.2 Redeploy Vercel if you change `VITE_API_URL`

Environment variables are baked in at **build time** for Vite.

If you change `VITE_API_URL` on Vercel:

1. Vercel → Project → **Settings** → **Environment Variables**
2. Edit `VITE_API_URL`
3. **Deployments** → latest deployment → **⋯** → **Redeploy**

---

## 7. Step 5 — Seed demo users

The database starts empty. Run the seed script **once** on Render to create admin and user accounts.

### 7.1 Run seed on Render Shell

1. Render → your web service → **Shell** tab (may take a moment to connect).
2. Run:

   ```bash
   npm run seed
   ```

3. Expected output:

   ```
   Connected to MongoDB
   Admin created: admin@rbacpro.com / Admin@123456
   User created: user@rbacpro.com / User@123456
   Seed completed
   ```

### 7.2 Demo accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@rbacpro.com` | `Admin@123456` |
| **User** | `user@rbacpro.com` | `User@123456` |

**Change these passwords** before any real production use.

---

## 8. Step 6 — Verify everything works

Use this checklist after deployment:

### API checks

- [ ] `GET https://YOUR-API.onrender.com/api/health` → `"success": true`
- [ ] First request after idle may be slow (free tier cold start)

### Frontend checks

- [ ] Landing page loads on Vercel URL
- [ ] `/login` page renders (no white screen)
- [ ] `/register` page renders

### Auth checks

- [ ] Login as `admin@rbacpro.com` → redirects to `/dashboard`
- [ ] Sidebar shows **Administration** section (Users, All Tasks, Analytics, Activity)
- [ ] Logout works
- [ ] Login as `user@rbacpro.com` → no admin menu
- [ ] User visiting `/admin` → unauthorized page

### Feature checks

- [ ] Create a project
- [ ] Create a task
- [ ] Admin → Activity logs show `LOGIN` and `TASK_CREATED` events

### Browser DevTools (if login fails)

1. Press **F12** → **Network** tab.
2. Try login.
3. Click the `login` request:
   - **Status 200** → API OK; check response body for `accessToken`
   - **Status 0 / CORS error** → fix `CLIENT_URL` on Render
   - **Status 502 / 503** → API waking up or crashed; check Render logs
   - **404 on `/api/...`** → wrong `VITE_API_URL` (missing `/api` or wrong domain)

---

## 9. Environment variables reference

### Backend (Render) — `backend/.env.example`

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` on Render |
| `PORT` | Yes | `5000` |
| `MONGODB_URI` | Yes | Atlas connection string |
| `JWT_ACCESS_SECRET` | Yes | Signs access tokens |
| `JWT_REFRESH_SECRET` | Yes | Signs refresh tokens |
| `JWT_ACCESS_EXPIRES` | No | Default `15m` |
| `JWT_REFRESH_EXPIRES` | No | Default `7d` |
| `CLIENT_URL` | Yes | Frontend origin(s), comma-separated |
| `RATE_LIMIT_WINDOW_MS` | No | Default 15 min |
| `RATE_LIMIT_MAX` | No | Default 100 |
| `LOG_LEVEL` | No | `info` or `debug` |

### Frontend (Vercel) — `frontend/.env.example`

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (prod) | Full API base URL including `/api` |

**Development vs production:**

| Environment | `VITE_API_URL` |
|-------------|----------------|
| Local (`npm run dev`) | `/api` (Vite proxy → localhost:5000) |
| Vercel production | `https://your-api.onrender.com/api` |

---

## 10. Updating after code changes

### Push to GitHub

```powershell
cd f:\avidus
git add .
git commit -m "describe your change"
git push origin main
```

### Auto-deploy

- **Render:** redeploys on push to `main` if auto-deploy is enabled (default).
- **Vercel:** redeploys on push to `main` if connected to that branch.

### Manual redeploy

- Render → **Manual Deploy** → **Deploy latest commit**
- Vercel → **Deployments** → **Redeploy**

---

## 11. Troubleshooting (detailed)

### Login fails — “Cannot reach server” / Network Error

| Cause | Solution |
|-------|----------|
| API asleep (Render free) | Wait 30–60s, retry |
| API crashed | Render → **Logs** tab, fix error (often bad `MONGODB_URI`) |
| Wrong `VITE_API_URL` | Must be `https://xxx.onrender.com/api` |
| Forgot to redeploy Vercel after env change | Redeploy frontend |

### CORS error in browser console

```
Access to XMLHttpRequest at 'https://api...' from origin 'https://app.vercel.app' has been blocked by CORS
```

| Cause | Solution |
|-------|----------|
| `CLIENT_URL` missing or wrong | Set exact Vercel URL on Render, redeploy API |
| `http` vs `https` mismatch | Both must use HTTPS in production |
| Trailing slash | `https://app.vercel.app` not `https://app.vercel.app/` |

### MongoDB connection errors (Render logs)

| Error | Solution |
|-------|----------|
| `ECONNREFUSED` | Wrong URI; cluster paused; typo in password |
| `Authentication failed` | Wrong password; URL-encode special chars in password |
| `IP not whitelisted` | Atlas → Network Access → allow `0.0.0.0/0` |

### White screen on `/login` or `/register`

| Cause | Solution |
|-------|----------|
| JavaScript build error | Vercel → Deployment → **Build Logs** |
| Wrong root directory | Must be `frontend`, not repo root |
| API not required for page render | Check browser **Console** for React errors |

### 404 when refreshing `/dashboard`

- Ensure `frontend/vercel.json` exists and redeploy Vercel.

### `EADDRINUSE` locally

Another process uses port 5000:

```powershell
netstat -ano | findstr ":5000"
taskkill /PID <PID> /F
```

### Render build succeeds but service unhealthy

- Health check path must be `/api/health`
- Check logs for MongoDB connection failure on startup

---

## 12. Alternative hosting options

Same architecture; different providers:

| Component | Alternative | Notes |
|-----------|-------------|-------|
| Database | Railway MongoDB, Atlas only | Atlas is simplest |
| Backend | Railway, Fly.io, Cyclic | Set root to `backend`, `npm start` |
| Frontend | Netlify, Cloudflare Pages | Build: `npm run build`, publish `frontend/dist` |
| Full stack | Railway (both services) | Two services + Atlas still recommended |

**Netlify** frontend env: same `VITE_API_URL`, add `_redirects` or `netlify.toml` for SPA:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 13. Security checklist for production

Before exposing to real users:

- [ ] Change seed passwords; delete or disable demo accounts
- [ ] Use strong unique `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Restrict Atlas IP allowlist if you know your host’s IPs
- [ ] Set `NODE_ENV=production`
- [ ] Do not commit `.env` files (already in `.gitignore`)
- [ ] Enable HTTPS only (Render/Vercel do this by default)
- [ ] Review rate limits (`RATE_LIMIT_MAX`)

---

## Quick reference — deployment order

```
1. MongoDB Atlas  →  get MONGODB_URI
2. Render         →  deploy API, set env vars, get API URL
3. Test           →  /api/health
4. Vercel         →  deploy frontend, set VITE_API_URL
5. Render         →  set CLIENT_URL to Vercel URL, redeploy
6. Render Shell   →  npm run seed
7. Test           →  login on Vercel URL
```

---

## Links

- **GitHub:** https://github.com/benito-stephen/rbac-pro
- **Render docs:** https://render.com/docs
- **Vercel docs:** https://vercel.com/docs
- **MongoDB Atlas docs:** https://www.mongodb.com/docs/atlas

For local development, see the main [README.md](./README.md).
