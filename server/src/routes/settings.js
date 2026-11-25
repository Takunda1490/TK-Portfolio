import { Router } from 'express';
import { pool } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT `key`, `value` FROM site_settings');
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({ settings });
  } catch (e) { next(e); }
});

router.put('/', requireAuth, async (req, res, next) => {
  try {
    const entries = Object.entries(req.body || {});
    if (!entries.length) return res.status(400).json({ error: 'No settings provided' });
    for (const [key, value] of entries) {
      await pool.query(
        'INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value`=VALUES(`value`)',
        [key, value == null ? null : String(value)]
      );
    }
    const [rows] = await pool.query('SELECT `key`, `value` FROM site_settings');
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({ settings });
  } catch (e) { next(e); }
});

export default router;
