# Deploy RBAC PRO in ~15 minutes

Repo: **https://github.com/benito-stephen/rbac-pro** (branch `main`)

## Option A — Dashboard (no API keys)

### Phase 2 — Render

1. Open https://dashboard.render.com/select-repo?type=web
2. Connect GitHub → choose **rbac-pro**
3. Settings:

   | Field | Value |
   |-------|--------|
   | Name | `rbac-pro-api` |
   | Root Directory | `backend` |
   | Build | `npm install` |
   | Start | `npm start` |
   | Health Check | `/api/health` |

4. Environment → add variables from `deploy/local.env` (run script below to generate).
5. **Create Web Service** → wait for deploy.
6. **Shell** tab → `npm run seed`
7. Copy URL: `https://rbac-pro-api.onrender.com` (yours may differ)

Generate env file locally:

```powershell
cd f:\avidus
.\scripts\generate-deploy-env.ps1
notepad deploy\local.env
```

### Phase 3 — Vercel

1. https://vercel.com/new → import **rbac-pro**
2. Root Directory: **frontend**
3. Environment variable:

   ```
   VITE_API_URL=https://YOUR-RENDER-URL.onrender.com/api
   ```

4. Deploy → copy site URL.

### Phase 4 — CORS

1. Render → Environment → `CLIENT_URL` = your Vercel URL (no trailing slash)
2. Save → redeploy API.

---

## Option B — CLI (send API keys to agent or run yourself)

```powershell
cd f:\avidus
.\scripts\generate-deploy-env.ps1

$env:RENDER_API_KEY = "rnd_YOUR_KEY"
.\scripts\deploy-render.ps1

# After Render is live:
$env:VERCEL_TOKEN = "YOUR_VERCEL_TOKEN"
.\scripts\deploy-vercel.ps1 -ApiUrl "https://rbac-pro-api.onrender.com/api"
```

---

## Verify

- API: `https://YOUR-API.onrender.com/api/health`
- Login: `admin@rbacpro.com` / `Admin@123456`
