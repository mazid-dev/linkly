# Linkly

A production-grade URL shortener SaaS with analytics.

## Tech Stack
- Backend: Node.js 20 + Express + TypeScript
- Frontend: React 18 + Vite + TypeScript
- Database: PostgreSQL 16
- Cache: Redis 7

## Local Development

### 1. Start Postgres + Redis
docker run -d --name linkly-pg -e POSTGRES_USER=linkly -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=linkly -p 5432:5432 postgres:16-alpine
docker run -d --name linkly-redis -p 6379:6379 redis:7-alpine

### 2. Backend
cd backend
cp .env.example .env
npm install
npm run migrate
npm run dev

### 3. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev

## API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/shorten
- GET  /api/urls
- GET  /api/urls/:id/stats
- GET  /:code
- GET  /health
