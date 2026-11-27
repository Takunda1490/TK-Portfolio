# Railway Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- GitHub repo connected

## Setup

### 1. Add MySQL Database
- In Railway project: **New** → **Database** → **MySQL**
- Note the connection variables (auto-injected as `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`)

### 2. Configure Environment Variables
In Railway project settings → **Variables**, add:

```bash
# Server
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-domain.railway.app

# Database (auto-filled from MySQL plugin)
DB_HOST=${MYSQLHOST}
DB_PORT=${MYSQLPORT}
DB_USER=${MYSQLUSER}
DB_PASSWORD=${MYSQLPASSWORD}
DB_NAME=${MYSQLDATABASE}
DB_SSL=false

# Auth (generate secure values)
JWT_SECRET=your-super-long-random-string-here
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-password-here

# ImageKit (your credentials)
IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# SMTP (configure for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=app_password
SMTP_FROM="TK Portfolio <you@gmail.com>"
ADMIN_NOTIFY_EMAIL=you@gmail.com
```

### 3. Deploy
- Push to GitHub
- Railway auto-deploys on push to main
- Check logs for migration status

### 4. Custom Domain (Optional)
- Settings → **Domains** → **Add Custom Domain**
- Update `CLIENT_URL` to your custom domain

## Commands

| Command | Description |
|---------|-------------|
| `railway login` | Authenticate CLI |
| `railway link` | Link local folder to project |
| `railway up` | Manual deploy |
| `railway logs` | View logs |
| `railway variables` | Manage env vars |

## Troubleshooting

**Migration fails**: Check DB connection variables match MySQL plugin.

**Build fails**: Ensure `pnpm-lock.yaml` is committed.

**Static files not served**: Verify `client/dist` exists after build phase.

**CORS errors**: Ensure `CLIENT_URL` matches your Railway domain exactly.