# Stream Vault Phase 2 — Quick Start Deployment Guide

## 🚀 One-Command Deployment

Everything is ready. Follow these exact steps to deploy the modernized app to Cloud Run.

---

## **Step 1: Verify Local Build (30 seconds)**

```bash
cd ~/path/to/stream-vault

# Check that everything compiles
npm run lint        # Should print: 0 errors
npm run build       # Should complete in < 10 seconds
npm run start       # Should start on port 3000

# In another terminal, verify it works:
curl http://localhost:3000/health
# Should return: { status: 'ok', service: 'ajn-liberty-play-api', database: '...', timestamp: '...' }
```

✅ If all three commands succeed, proceed to Step 2.

---

## **Step 2: Push to GitHub (1 minute)**

GitHub is your **source of truth**. Once you push, GitHub Actions automatically handles building, testing, and deploying to Cloud Run.

### Option A: Using Git Command Line (Recommended)

```bash
cd ~/path/to/stream-vault

# Stage all changes (ArchiveHomeModern, CI/CD config, etc.)
git add -A

# Commit with a clear message
git commit -m "Phase 2: Modernize UI with ArchiveHomeModern poster grid layout

Features:
- Card-grid poster layout with program-specific gradients
- Hero resume banner with continue button
- Sticky search bar with real-time filtering
- Responsive grid (1-4 columns based on viewport)
- Fixed bottom dock navigation
- Hover effects with play button overlay

Deployment:
- GitHub Actions CI/CD pipeline
- Google Cloud Build configuration
- Cloud Run ready (512MB, 1 vCPU, us-central1)"

# Push to GitHub (this triggers CI/CD automatically)
git push origin main
```

### Option B: Using GitHub Desktop or VS Code

1. Open GitHub Desktop / VS Code Git panel
2. Stage all changes (checkmark each file)
3. Commit with message above
4. Click "Push to origin"

✅ **GitHub Actions now runs automatically** — watch it in your GitHub repo's "Actions" tab.

---

## **Step 3: Verify GitHub Actions Deployment (2-3 minutes)**

After pushing, GitHub Actions will:

1. **Lint** — Check TypeScript (should pass)
2. **Build** — Compile Vite + esbuild (should complete in < 10s)
3. **Verify** — Check dist/ artifacts (should all be present)
4. **Authenticate** — Use Workload Identity Federation to access Google Cloud
5. **Push to GCR** — Upload Docker image to Google Container Registry
6. **Deploy to Cloud Run** — Launch new revision with updated code
7. **Smoke Tests** — Verify /health and / endpoints respond

**Watch the deployment live:**

```bash
# In your browser, go to:
https://github.com/banamine/stream-vault/actions

# Click on the latest workflow run (green checkmark = success)
# Each step shows live output
```

Or from CLI:

```bash
# Watch Cloud Run deployments:
gcloud run services describe stream-vault --region us-central1 --format="table(status.latestReadyRevision,status.url)"

# Watch logs:
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=stream-vault" \
  --limit 50 --format json --follow
```

---

## **Step 4: Verify the Live App (5 minutes after push)**

Once GitHub Actions finishes (green checkmark), your app is live.

### Check Health

```bash
curl https://ais-dev-b54cjczgdn7dcvfkp7jurj-804326557407.us-east1.run.app/health

# Expected response:
# { "status": "ok", "service": "ajn-liberty-play-api", "database": "...", "timestamp": "..." }
```

### Open in Browser

Navigate to your Cloud Run URL:
```
https://ais-dev-b54cjczgdn7dcvfkp7jurj-804326557407.us-east1.run.app
```

**You should now see:**
- ✅ Hero resume banner (amber gradient background)
- ✅ Poster card grid (red/orange/blue/purple gradients)
- ✅ Sticky search bar
- ✅ Bottom dock navigation (Home, Explore, Settings)
- ✅ Responsive layout (test on mobile: single column, no horizontal scroll)

---

## **Prerequisites: GitHub Actions Secrets**

⚠️ **If the deployment fails at authentication**, you need to set up GitHub Secrets first.

### Add GitHub Secrets (One-time Setup)

1. Go to your GitHub repo: `https://github.com/banamine/stream-vault`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these three:

| Secret Name | Value | How to Find |
|-------------|-------|------------|
| `WIF_PROVIDER` | `projects/{PROJECT_ID}/locations/global/workloadIdentityPools/{POOL_ID}/providers/{PROVIDER_ID}` | From Google Cloud (ask your GCP admin) |
| `WIF_SERVICE_ACCOUNT` | `stream-vault-sa@{PROJECT_ID}.iam.gserviceaccount.com` | From Google Cloud IAM |
| `GCP_PROJECT_ID` | Your Google Cloud Project ID (e.g., `my-project-123456`) | From Google Cloud Console |

If you don't have these yet, ask your GCP admin or contact Anthropic for setup help.

---

## **Fallback: Manual Cloud Run Deployment**

If GitHub Actions isn't set up yet, you can deploy directly:

```bash
cd ~/path/to/stream-vault

# Verify build locally
npm run build

# Deploy directly to Cloud Run
gcloud run deploy stream-vault \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --timeout 3600 \
  --project YOUR_GCP_PROJECT_ID

# Wait 2-3 minutes, then visit the URL printed by the command
```

---

## **Troubleshooting**

### GitHub Actions Fails at "Authenticate to Google Cloud"

**Cause**: GitHub Secrets not configured  
**Fix**: Add the three secrets in GitHub Settings → Secrets (see Prerequisites above)

### Cloud Run Deployment Shows "Application Error"

**Cause**: Build artifacts missing or server didn't start  
**Check**:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=stream-vault" \
  --limit 20 --format json
```

**Fix**: Ensure `npm run lint` and `npm run build` pass locally first.

### Browser Shows Old Layout (Not Modernized)

**Cause**: You're viewing a cached version or the old deployment  
**Fix**: 
1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Wait 3 minutes for cold start if deployment just finished
3. Check Cloud Run console to verify latest revision is active

### Search Bar Not Filtering

**Cause**: Data not loaded  
**Check**: Open F12 (DevTools) → Network → look for `/api/v1/assets` request  
**Fix**: Check server logs for database errors

---

## **Verification Checklist**

After deployment, verify each item:

- [ ] GitHub Actions workflow shows green checkmark
- [ ] Cloud Run service shows "OK" status
- [ ] `curl /health` returns 200 with JSON
- [ ] Browser loads homepage (no 404 or 500 error)
- [ ] Poster cards visible (4 columns on desktop, 1 on mobile)
- [ ] Search bar filters records in real-time
- [ ] Hero resume banner displays at top
- [ ] Bottom dock navigation visible and interactive
- [ ] Click a media card → player loads (deep linking works)
- [ ] F12 Console shows no errors

---

## **What's Been Deployed**

**GitHub is now your source of truth:**

```
stream-vault/ (GitHub repo)
├── src/
│   ├── components/
│   │   ├── ArchiveHomeModern.tsx    ← NEW: Poster grid layout
│   │   └── ArchiveHome.tsx          ← OLD: Replaced by above
│   ├── App.tsx                      ← UPDATED: Imports ArchiveHomeModern
│   └── ... (other components unchanged)
├── .github/workflows/
│   └── ci.yml                       ← NEW: GitHub Actions pipeline
├── cloudbuild.yaml                  ← NEW: Google Cloud Build config
├── .gcloudignore                    ← NEW: Deployment exclusions
├── Dockerfile                       ← EXISTING: Builds container
├── package.json                     ← EXISTING: Dependencies (unchanged)
└── ... (other files unchanged)
```

**When you push to GitHub:**
1. GitHub Actions runs `.github/workflows/ci.yml`
2. Lint → Build → Verify artifacts
3. Authenticate to Google Cloud (WIF)
4. Push Docker image to GCR
5. Deploy to Cloud Run
6. Run smoke tests
7. ✅ App goes live

**Cloud Run will always have the latest code from GitHub.**

---

## **Next Steps**

1. **Right now**: Run `git push origin main` (or use GitHub Desktop)
2. **While waiting (2-3 min)**: Watch GitHub Actions in your repo's Actions tab
3. **When finished**: Open your Cloud Run URL in a browser
4. **Verify**: See the poster grid, hero banner, search bar, bottom dock
5. **If stuck**: Check troubleshooting section above

---

## **Quick Links**

- GitHub repo: https://github.com/banamine/stream-vault
- GitHub Actions: https://github.com/banamine/stream-vault/actions
- Cloud Run service: https://console.cloud.google.com/run (search "stream-vault")
- Cloud Logging: https://console.cloud.google.com/logs

---

**TL;DR: `git push origin main` → GitHub Actions handles the rest → App is live in 2-3 minutes.**
