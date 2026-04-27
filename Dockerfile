# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next

# FIXED: Copy public folder only if it exists in the builder stage
# This prevents the "not found" error you encountered
COPY --from=builder /app/public* ./public/

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Use dumb-init to run Node
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["npm", "start"]