import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function slugify(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

router.get('/', async (req, res, next) => {
  try {
    let isAdmin = false;
    const token = req.cookies?.token;
    if (token) {
      try { jwt.verify(token, process.env.JWT_SECRET); isAdmin = true; } catch { isAdmin = false; }
    }
    let rows;
    if (isAdmin) {
      [rows] = await pool.query('SELECT * FROM projects ORDER BY `order` ASC, id ASC');
    } else {
      [rows] = await pool.query('SELECT * FROM projects WHERE published = TRUE ORDER BY `order` ASC, id ASC');
    }
    res.json({ projects: rows });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ project: rows[0] });
  } catch (e) { next(e); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title, slug, description, tech_stack, live_url, repo_url, cover_image, order, published } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title required' });
    const s = slug || slugify(title);
    const [r] = await pool.query(
      `INSERT INTO projects (title, slug, description, tech_stack, live_url, repo_url, cover_image, \`order\`, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, s, description || null, tech_stack ? JSON.stringify(tech_stack) : null, live_url || null, repo_url || null, cover_image || null, order || 0, published ? 1 : 0]
    );
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [r.insertId]);
    res.status(201).json({ project: rows[0] });
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { title, slug, description, tech_stack, live_url, repo_url, cover_image, order, published } = req.body || {};
    const [existing] = await pool.query('SELECT id FROM projects WHERE id = ?', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Not found' });
    await pool.query(
      `UPDATE projects SET title=?, slug=?, description=?, tech_stack=?, live_url=?, repo_url=?, cover_image=?, \`order\`=?, published=? WHERE id=?`,
      [title, slug, description || null, tech_stack ? JSON.stringify(tech_stack) : null, live_url || null, repo_url || null, cover_image || null, order || 0, published ? 1 : 0, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    res.json({ project: rows[0] });
  } catch (e) { next(e); }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
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
        await conn.query('UPDATE projects SET `order` = ? WHERE id = ?', [i, ids[i]]);
      }
      await conn.commit();
    } catch (e) { await conn.rollback(); throw e; }
    finally { conn.release(); }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
