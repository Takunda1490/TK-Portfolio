import { Router } from 'express';
import { pool } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM social_links ORDER BY `order` ASC, id ASC');
    res.json({ social_links: rows });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM social_links WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ social_link: rows[0] });
  } catch (e) { next(e); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { platform, url, icon, order } = req.body || {};
    if (!platform || !url) return res.status(400).json({ error: 'platform and url required' });
    const [r] = await pool.query(
      `INSERT INTO social_links (platform, url, icon, \`order\`)
       VALUES (?, ?, ?, ?)`,
      [platform, url, icon || null, order || 0]
    );
    const [rows] = await pool.query('SELECT * FROM social_links WHERE id = ?', [r.insertId]);
    res.status(201).json({ social_link: rows[0] });
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { platform, url, icon, order } = req.body || {};
    const [existing] = await pool.query('SELECT id FROM social_links WHERE id = ?', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Not found' });
    await pool.query(
      `UPDATE social_links SET platform=?, url=?, icon=?, \`order\`=? WHERE id=?`,
      [platform, url, icon || null, order || 0, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM social_links WHERE id = ?', [req.params.id]);
    res.json({ social_link: rows[0] });
  } catch (e) { next(e); }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM social_links WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;