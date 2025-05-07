# 1. Use an official Node.js runtime as a parent image
# Using a specific LTS version is good practice (e.g., 20-alpine)
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# --- Dependencies ---
FROM base AS deps
# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./
# Install dependencies
RUN pnpm install --frozen-lockfile

# --- Builder ---
FROM base AS builder
COPY --from=deps /app/node_modules /app/node_modules
COPY . .

COPY .env .env
# Build the Next.js application
RUN pnpm build

# --- Runner ---
FROM base AS runner
WORKDIR /app

# Set environment variables
# You might need to pass NEXT_PUBLIC_API_URL at runtime
ENV NODE_ENV=production
# ENV NEXT_PUBLIC_API_URL=your_api_url_here # Or set it during docker run

COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Expose port 3000 (Next.js default port)
EXPOSE 3000

# Set the user to non-root for better security
USER node

# Command to run the application
CMD ["node", "server.js"]