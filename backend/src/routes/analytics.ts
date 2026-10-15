import { Router } from 'express';
import { db } from '../db';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/urls', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await db.query(
      'SELECT id, code, original_url, clicks, created_at, last_clicked_at FROM urls WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/urls/:id/stats', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const urlResult = await db.query(
      'SELECT id, code, original_url, clicks FROM urls WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (!urlResult.rows[0]) return res.status(404).json({ error: 'Not found' });
    const daily = await db.query(
      `SELECT DATE(clicked_at) as day, COUNT(*) as count
       FROM clicks WHERE url_id = $1 AND clicked_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(clicked_at) ORDER BY day`,
      [id]
    );
    res.json({ url: urlResult.rows[0], daily: daily.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
