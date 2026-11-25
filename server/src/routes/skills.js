import { Router } from 'express';
import { pool } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM skills ORDER BY category ASC, `order` ASC, id ASC');
    const grouped = {};
    for (const row of rows) {
      (grouped[row.category] = grouped[row.category] || []).push(row);
    }
    res.json({ skills: grouped });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM skills WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ skill: rows[0] });
  } catch (e) { next(e); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name, level, category, order } = req.body || {};
    if (!name || !category) return res.status(400).json({ error: 'name and category required' });
    const [r] = await pool.query(
      `INSERT INTO skills (name, level, category, \`order\`)
       VALUES (?, ?, ?, ?)`,
      [name, level || 0, category, order || 0]
    );
    const [rows] = await pool.query('SELECT * FROM skills WHERE id = ?', [r.insertId]);
    res.status(201).json({ skill: rows[0] });
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { name, level, category, order } = req.body || {};
    const [existing] = await pool.query('SELECT id FROM skills WHERE id = ?', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Not found' });
    await pool.query(
      `UPDATE skills SET name=?, level=?, category=?, \`order\`=? WHERE id=?`,
      [name, level || 0, category, order || 0, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM skills WHERE id = ?', [req.params.id]);
    res.json({ skill: rows[0] });
  } catch (e) { next(e); }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM skills WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;