import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { pool } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import nodemailer from 'nodemailer';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many contact submissions. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// POST /api/contact  (public, rate-limited) -> save message + notify admin + auto-reply visitor
router.post('/contact', contactLimiter, async (req, res, next) => {
  try {
    const { name, email, subject, body } = req.body || {};
    if (!name || !email || !body) {
      return res.status(400).json({ error: 'name, email and body required' });
    }

    const [r] = await pool.query(
      'INSERT INTO messages (name, email, subject, body) VALUES (?, ?, ?, ?)',
      [name, email, subject || null, body]
    );

    // Notify admin of new message
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER,
        subject: `New contact message: ${subject || '(no subject)'}`,
        text: `From: ${name} <${email}>\n\n${body}`,
        html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p>${String(body).replace(/\n/g, '<br>')}</p>`,
      });
    } catch (mailErr) {
      console.error('Admin notification email failed:', mailErr.message);
    }

    // Auto-reply to visitor (optional)
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Thanks for reaching out — TK Portfolio',
        text: `Hi ${name},\n\nThanks for your message. I'll get back to you soon.\n\n— TK`,
        html: `<p>Hi ${name},</p><p>Thanks for your message. I'll get back to you soon.</p><p>— TK</p>`,
      });
    } catch (mailErr) {
      console.error('Auto-reply email failed:', mailErr.message);
    }

    const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [r.insertId]);
    res.status(201).json({ message: rows[0] });
  } catch (e) { next(e); }
});

// GET /api/messages  (auth, paginated)
router.get('/messages', requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      'SELECT * FROM messages ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM messages');

    res.json({ messages: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});

// PATCH /api/messages/:id/read  (auth)
router.patch('/messages/:id/read', requireAuth, async (req, res, next) => {
  try {
    const [r] = await pool.query(
      'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [req.params.id]);
    res.json({ message: rows[0] });
  } catch (e) { next(e); }
});

// PATCH /api/messages/:id/unread  (auth)
router.patch('/messages/:id/unread', requireAuth, async (req, res, next) => {
  try {
    const [r] = await pool.query(
      'UPDATE messages SET read_at = NULL WHERE id = ?',
      [req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [req.params.id]);
    res.json({ message: rows[0] });
  } catch (e) { next(e); }
});

// DELETE /api/messages/:id  (auth)
router.delete('/messages/:id', requireAuth, async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM messages WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
