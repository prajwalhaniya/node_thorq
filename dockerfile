# Stage 1: Build the app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (for caching)
COPY package*.json yarn.lock ./

# Install all dependencies (dev + prod, needed for build)
RUN yarn install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the TypeScript code
RUN yarn tsc

# Stage 2: Production runtime
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only necessary files from builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/yarn.lock ./
COPY --from=builder /usr/src/app/dist ./dist

# Install only production dependencies
RUN yarn install --production --frozen-lockfile

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["node", "dist/server.js"]
