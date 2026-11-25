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
# server
cd server && npm install && cp ../.env.example .env && npm run dev
# client (new terminal)
cd client && npm install && npm run dev
```
Client: http://localhost:5173 · API: http://localhost:5000

## Env vars
See `.env.example`.
