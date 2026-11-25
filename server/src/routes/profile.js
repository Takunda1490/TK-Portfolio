import { Router } from 'express';
import { pool } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, name, title, bio, avatar_url, resume_url, updated_at FROM profile WHERE id = 1');
    res.json({ profile: rows[0] || null });
  } catch (e) { next(e); }
});

router.put('/', requireAuth, async (req, res, next) => {
  try {
    const { name, title, bio, avatar_url, resume_url } = req.body || {};
    if (!name || !title) return res.status(400).json({ error: 'name and title required' });
    await pool.query(
      `INSERT INTO profile (id, name, title, bio, avatar_url, resume_url)
       VALUES (1, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), title=VALUES(title), bio=VALUES(bio), avatar_url=VALUES(avatar_url), resume_url=VALUES(resume_url)`,
      [name, title, bio || null, avatar_url || null, resume_url || null]
    );
    const [rows] = await pool.query('SELECT id, name, title, bio, avatar_url, resume_url, updated_at FROM profile WHERE id = 1');
    res.json({ profile: rows[0] });
  } catch (e) { next(e); }
});

export default router;
