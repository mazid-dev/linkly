# ============================================================
# Stage 1: Build (Node + Vite)
# ============================================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite env vars — build-time only (baked into JS bundle)
ARG VITE_API_URL
ARG VITE_BASE_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

RUN npm run build

# ============================================================
# Stage 2: Nginx serve static
# ============================================================
FROM nginx:alpine

# Custom SPA nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
