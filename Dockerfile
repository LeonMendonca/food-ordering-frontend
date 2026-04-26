# Base image
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build the Next.js app
# Note: Ensure NEXT_PUBLIC variables are available during build time if they point to the backend
ENV NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
RUN npm run build

# ---
# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy production assets
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Environment variables
ENV NODE_ENV=production

# Expose Next.js port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
