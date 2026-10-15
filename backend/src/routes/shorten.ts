import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/shorten', authMiddleware, async (req: AuthRequest, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  try { new URL(url); } catch { return res.status(400).json({ error: 'Invalid URL' }); }
  try {
    const code = nanoid(7);
    const result = await db.query(
      'INSERT INTO urls (user_id, code, original_url) VALUES ($1, $2, $3) RETURNING id, code, original_url, created_at',
      [req.userId, code, url]
    );
    const row = result.rows[0];
    res.json({ ...row, short_url: `${process.env.BASE_URL}/${row.code}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
