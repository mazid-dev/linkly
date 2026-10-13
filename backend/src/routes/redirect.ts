import { Router } from 'express';
import { db } from '../db';
import { redis } from '../redis';

const router = Router();

router.get('/:code', async (req, res) => {
  const { code } = req.params;
  if (code === 'health' || code === 'api') return res.status(404).end();
  try {
    let originalUrl = await redis.get(`url:${code}`);
    let urlId: number | null = null;
    if (!originalUrl) {
      const result = await db.query('SELECT id, original_url FROM urls WHERE code = $1', [code]);
      if (!result.rows[0]) return res.status(404).send('Not found');
      urlId = result.rows[0].id;
      originalUrl = result.rows[0].original_url;
      await redis.set(`url:${code}`, originalUrl, { EX: 3600 });
    } else {
      const idResult = await db.query('SELECT id FROM urls WHERE code = $1', [code]);
      urlId = idResult.rows[0]?.id ?? null;
    }
    if (urlId) {
      db.query('INSERT INTO clicks (url_id, ip, user_agent) VALUES ($1, $2, $3)',
        [urlId, req.ip, req.headers['user-agent'] || '']).catch(console.error);
      db.query('UPDATE urls SET clicks = clicks + 1, last_clicked_at = NOW() WHERE id = $1',
        [urlId]).catch(console.error);
    }
    res.redirect(302, originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;
