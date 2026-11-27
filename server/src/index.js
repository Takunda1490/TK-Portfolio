import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './db/connection.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import settingsRoutes from './routes/settings.js';
import projectsRoutes from './routes/projects.js';
import servicesRoutes from './routes/services.js';
import skillsRoutes from './routes/skills.js';
import socialLinksRoutes from './routes/social_links.js';
import messagesRoutes from './routes/messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

app.use(helmet({
  contentSecurityPolicy: IS_PRODUCTION ? undefined : false,
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/social-links', socialLinksRoutes);
app.use('/api', messagesRoutes);

if (IS_PRODUCTION) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

testConnection().then(() => {
  app.listen(PORT, () => console.log(`API running on :${PORT}`));
});
