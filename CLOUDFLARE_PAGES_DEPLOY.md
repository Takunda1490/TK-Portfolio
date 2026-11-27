# Cloudflare Pages Deployment (Client Only)

## What Cloudflare Pages Hosts
- **Static assets / SPA** (React build output)
- **NOT** the Node.js backend API

## Architecture
```
┌─────────────────┐     API calls      ┌──────────────────┐
│ Cloudflare Pages │ ─────────────────► │  Render/Railway  │
│ (Client - SPA)   │ ◄───────────────── │  (API Server)    │
└─────────────────┘   JSON responses   └──────────────────┘
```

## Setup

### 1. Deploy API First (Render/Railway/Fly.io)
Get your API URL: `https://tk-portfolio-api.onrender.com`

### 2. Cloudflare Pages Setup
- Go to https://dash.cloudflare.com → **Pages** → **Create a project**
- Connect GitHub → Select `TK-Portfolio`
- Configure:

| Setting | Value |
|---------|-------|
| **Project name** | `tk-portfolio-client` |
| **Production branch** | `main` |
| **Root directory** | `/` (repo root) |
| **Build command** | `cd client && pnpm install && pnpm run build` |
| **Build output directory** | `client/dist` |
| **Node version** | `20` |

### 3. Environment Variables
In Pages project → **Settings** → **Environment variables**:

```bash
VITE_API_BASE=https://tk-portfolio-api.onrender.com/api
```

### 4. Deploy
- Push to main → auto-deploys
- Or: **Create deploy** → **Deploy**

## Custom Domain
- Pages project → **Custom domains** → **Add domain**
- Add `portfolio.yourdomain.com` (or root)
- Cloudflare handles SSL automatically

## SPA Routing & Headers
Configured via `client/public/_redirects` and `client/public/_headers` (copied to `dist` on build):

**`client/public/_redirects`** - SPA fallback:
```
/*    /index.html   200
```

**`client/public/_headers`** - Security headers:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

## API URL in Client
`client/src/api.js` uses `VITE_API_BASE` env var (falls back to `/api` for local):

```javascript
const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || '/api';
```

## Benefits
- **Free** (unlimited bandwidth, requests)
- **Global CDN** (fast worldwide, including Zimbabwe)
- **DDoS protection** included
- **Instant cache purge** on deploy
- **Preview deployments** per PR

## Limitations
- No server-side code (use Render/Railway for API)
- Build time limit: 10 min (fine for Vite)
- 500 builds/month free

## Alternative: Full-stack on Cloudflare
Use **Cloudflare Workers** + **D1 (SQLite)** / **Hyperdrive** for DB - but requires rewriting the Node backend to Workers runtime.