# Sincerely Backend Server
# Deploys the Express API + BullMQ workers

FROM node:20-slim

WORKDIR /app

# Copy workspace config
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

# Install all dependencies (including shared workspace)
RUN npm install --workspace=shared --workspace=server

# Copy source code
COPY shared/ ./shared/
COPY server/ ./server/

# Build shared types first, then server
RUN npm run build --workspace=shared && npm run build --workspace=server

# Expose port (Koyeb uses PORT env var, default 8000; Render uses 3001)
EXPOSE ${PORT:-8000}

# Start the server
CMD ["npm", "run", "start", "--workspace=server"]
