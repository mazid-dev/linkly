import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './db';
import { redis, connectRedis } from './redis';
import authRoutes from './routes/auth';
import shortenRoutes from './routes/shorten';
import analyticsRoutes from './routes/analytics';
import redirectRoutes from './routes/redirect';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.set('trust proxy', 1);
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    await redis.ping();
    res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: (err as Error).message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api', shortenRoutes);
app.use('/api', analyticsRoutes);
app.use('/', redirectRoutes);

async function start() {
  try {
    await db.query('SELECT 1');
    console.log('PostgreSQL connected');
    await connectRedis();
    console.log('Redis connected');
    app.listen(PORT, () => console.log(`Linkly backend running on port ${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await db.end();
  await redis.quit();
  process.exit(0);
});

start();
