# Render Deployment Guide

## Prerequisites
- Render account (https://render.com)
- GitHub repo connected
- TiDB Cloud database (or use Render's free PostgreSQL)

## Option A: Use Existing TiDB Cloud (MySQL)

### 1. Create Web Service
- Render Dashboard → **New** → **Web Service**
- Connect GitHub repo: `TK-Portfolio`
- Render detects `render.yaml` automatically

### 2. Configure Environment Variables
In service settings → **Environment**, add:

```bash
# Required - Database (from TiDB Cloud)
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=portfolio
DB_SSL=true

# Required - Auth
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-password

# Optional - ImageKit, SMTP
IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=app_password
SMTP_FROM="TK Portfolio <you@gmail.com>"
ADMIN_NOTIFY_EMAIL=you@gmail.com
```

### 3. Auto-Deploy
- Push to main → auto-deploys
- Build runs migrations, builds client, starts server

## Option B: Use Render PostgreSQL (Free)

### 1. Add Database
- Dashboard → **New** → **PostgreSQL** → **Free**
- Note connection details

### 2. Update Database Config
In `server/src/db/connection.js`, the pool already works with PostgreSQL via `mysql2` - **won't work directly**.

**You'd need to:**
- Switch to `pg` package or use a MySQL-compatible provider
- Or keep TiDB Cloud (recommended - it's MySQL-compatible)

### 3. Update Environment
```bash
DB_HOST=your-render-pg-host
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=portfolio
DB_SSL=true
```

## Render Free Tier Limits
- **Web Service**: 750 hours/month (sleeps after 15min inactivity)
- **First request after sleep**: ~30-60s cold start
- **Bandwidth**: 100 GB/month
- **Build minutes**: 500/month

## Custom Domain
- Settings → **Custom Domains** → Add your domain
- Update `CLIENT_URL` to `https://yourdomain.com`

## Troubleshooting

**Build fails**: Check Node version (render.yaml uses default 20.x)

**Migration fails**: Ensure DB vars are set correctly in Render dashboard

**Static files 404**: Verify `client/dist` is built and served from `server/src/index.js`

**Cold starts**: Free tier spins down. Consider paid plan ($7/mo) for always-on.

## CLI Commands
```bash
npm install -g @render/cli
render login
render deploy
render logs -s tk-portfolio-api
```