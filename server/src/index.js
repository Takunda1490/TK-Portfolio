import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { testConnection } from './db/connection.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

testConnection().then(() => {
  app.listen(PORT, () => console.log(`API running on :${PORT}`));
});
