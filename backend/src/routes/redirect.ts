import { Router, Request, Response } from 'express';
import { db } from '../db';
import { redis } from '../redis';

const router = Router();

router.get('/:code', async (req: Request, res: Response) => {
  const { code } = req.params;

  if (code === 'health' || code === 'api') {
    return res.status(404).end();
  }

  try {
    const cached = await redis.get(`url:${code}`);

    let originalUrl: string | null = null;
    let urlId: number | null = null;

    if (cached) {
      originalUrl = String(cached);
      const idResult = await db.query(
        'SELECT id FROM urls WHERE code = $1',
        [code]
      );
      urlId = idResult.rows[0]?.id ? Number(idResult.rows[0].id) : null;
    } else {
      const result = await db.query(
        'SELECT id, original_url FROM urls WHERE code = $1',
        [code]
      );

      if (!result.rows[0]) {
        return res.status(404).send('Not found');
      }

      urlId = Number(result.rows[0].id);
      originalUrl = String(result.rows[0].original_url);

      await redis.set(`url:${code}`, originalUrl, { EX: 3600 });
    }

    if (!originalUrl) {
      return res.status(404).send('Not found');
    }

    if (urlId !== null) {
      db.query(
        'INSERT INTO clicks (url_id, ip, user_agent) VALUES ($1, $2, $3)',
        [urlId, req.ip || '', req.headers['user-agent'] || '']
      ).catch((err: unknown) => console.error('Click insert error:', err));

      db.query(
        'UPDATE urls SET clicks = clicks + 1, last_clicked_at = NOW() WHERE id = $1',
        [urlId]
      ).catch((err: unknown) => console.error('Click update error:', err));
    }

    return res.redirect(302, originalUrl);
  } catch (err: unknown) {
    console.error('Redirect error:', err);
    return res.status(500).send('Server error');
  }
});

export default router;