# TK Portfolio

Full-stack portfolio with an admin dashboard.

## Stack
- Frontend: React + Vite (Cloudflare Pages)
- Backend: Node.js + Express (Render)
- Database: TiDB Cloud Serverless (MySQL)
- Media: ImageKit CDN
- Email: SMTP via Nodemailer

## Local dev
```bash
# Install all dependencies (server + client) from the repo root
pnpm install

# Terminal 1 - server (API on :5000)
pnpm --filter tk-portfolio-server run dev

# Terminal 2 - client (on :5173)
pnpm --filter tk-portfolio-client run dev

# Copy env example for the server
cp server/.env.example server/.env
```
Client: http://localhost:5173 · API: http://localhost:5000

## Env vars
See `.env.example`.
