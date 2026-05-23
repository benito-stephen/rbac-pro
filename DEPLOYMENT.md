# RBAC PRO — Deployment Guide

Deploy the **frontend** and **backend** separately, with **MongoDB Atlas** for the database.

| Component | Recommended host | Free tier |
|-----------|------------------|-----------|
| MongoDB | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) | Yes |
| API (Node/Express) | [Render](https://render.com) | Yes |
| React (Vite) | [Vercel](https://vercel.com) | Yes |

---

## 1. MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com
2. **Database Access** → add a database user (username + password).
3. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) for cloud hosting.
4. **Database** → **Connect** → **Drivers** → copy the connection string.
5. Replace `<password>` and set the database name, e.g.:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/rbac_pro?retryWrites=true&w=majority
   ```

---

## 2. Backend API (Render)

### Option A — Blueprint (`render.yaml` in repo root)

1. Push this repo to GitHub.
2. Render → **New** → **Blueprint** → connect `benito-stephen/rbac-pro`.
3. Set secrets when prompted:
   - `MONGODB_URI` — Atlas connection string
   - `CLIENT_URL` — your Vercel URL (set after step 3), e.g. `https://rbac-pro.vercel.app`

### Option B — Manual Web Service

1. Render → **New** → **Web Service** → connect GitHub repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
3. **Environment variables:**

   | Key | Value |
   |-----|--------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | Atlas URI |
   | `JWT_ACCESS_SECRET` | long random string |
   | `JWT_REFRESH_SECRET` | different long random string |
   | `CLIENT_URL` | `https://YOUR-VERCEL-APP.vercel.app` |
   | `JWT_ACCESS_EXPIRES` | `15m` |
   | `JWT_REFRESH_EXPIRES` | `7d` |

4. Deploy. Note the URL, e.g. `https://rbac-pro-api.onrender.com`.

### Seed production database (once)

Render → your service → **Shell**:

```bash
npm run seed
```

Default accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rbacpro.com | Admin@123456 |
| User | user@rbacpro.com | User@123456 |

---

## 3. Frontend (Vercel)

1. https://vercel.com → **Add New** → **Project** → import GitHub repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. **Environment variable:**

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | `https://YOUR-RENDER-API.onrender.com/api` |

4. Deploy. Copy the Vercel URL (e.g. `https://rbac-pro.vercel.app`).

5. Go back to **Render** → set `CLIENT_URL` to your Vercel URL (no trailing slash) → **Redeploy** the API.

---

## 4. Verify

1. Open `https://YOUR-API.onrender.com/api/health` → should return `"success": true`.
2. Open your Vercel app → **Sign in** with seed credentials.
3. Test Dashboard, Projects, Tasks; admin: Command Center, Users, Activity.

---

## 5. Local development (unchanged)

```bash
# Terminal 1
docker start rbac-mongo   # or local MongoDB
cd backend && cp .env.example .env && npm install && npm run dev

# Terminal 2
cd frontend && cp .env.example .env && npm install && npm run dev
```

- API: http://localhost:5000  
- App: http://localhost:5173 (or next free port)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Login fails / network error | API not running; wrong `VITE_API_URL`; Render free tier spun down (wait ~30s) |
| CORS error | `CLIENT_URL` on Render must exactly match Vercel URL (https, no trailing `/`) |
| MongoDB connection failed | Atlas IP allowlist; correct password in URI |
| `EADDRINUSE` locally | Kill process on port 5000: `netstat -ano \| findstr :5000` then `taskkill /PID <id> /F` |
| 404 on refresh (Vercel) | `frontend/vercel.json` rewrites are included — redeploy frontend |

---

## GitHub branches

- `main` — stable baseline + full app after merge
- `feature/rbac-activity-tracking` — assignment feature branch (open PR to merge)
