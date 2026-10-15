# ============================================================
# Stage 1: Builder
# ============================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Install all deps (including dev)
COPY package*.json ./
RUN npm ci

# Copy source + build
COPY . .
RUN npm run build

# ============================================================
# Stage 2: Production Runtime
# ============================================================
FROM node:20-alpine

# Non-root user for security
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# Only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built code + migrations + scripts from builder
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --chown=app:app migrations ./migrations
COPY --chown=app:app scripts ./scripts

# Switch to non-root user
USER app

EXPOSE 3000

# Container-level health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
