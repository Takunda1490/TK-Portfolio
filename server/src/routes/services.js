import { Router } from 'express';
import { pool } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services ORDER BY `order` ASC, id ASC');
    res.json({ services: rows });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ service: rows[0] });
  } catch (e) { next(e); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title, description, icon, order } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title required' });
    const [r] = await pool.query(
      `INSERT INTO services (title, description, icon, \`order\`)
       VALUES (?, ?, ?, ?)`,
      [title, description || null, icon || null, order || 0]
    );
    const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [r.insertId]);
    res.status(201).json({ service: rows[0] });
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { title, description, icon, order } = req.body || {};
    const [existing] = await pool.query('SELECT id FROM services WHERE id = ?', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Not found' });
    await pool.query(
      `UPDATE services SET title=?, description=?, icon=?, \`order\`=? WHERE id=?`,
      [title, description || null, icon || null, order || 0, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    res.json({ service: rows[0] });
  } catch (e) { next(e); }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.patch('/reorder', requireAuth, async (req, res, next) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (let i = 0; i < ids.length; i++) {
        await conn.query('UPDATE services SET `order` = ? WHERE id = ?', [i, ids[i]]);
      }
      await conn.commit();
    } catch (e) { await conn.rollback(); throw e; }
    finally { conn.release(); }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;