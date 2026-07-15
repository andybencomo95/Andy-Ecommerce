# Backend Dockerfile
# Build: docker build --build-arg PRISMA_SCHEMA=prisma/schema.prod.prisma -t andy-ecommerce-backend .
# Default: uses prisma/schema.prisma (SQLite)

FROM node:20-alpine

ARG PRISMA_SCHEMA=prisma/schema.prisma

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm ci --only=production

# Code & Prisma
COPY prisma ./prisma
COPY src ./src
COPY tsconfig*.json ./

# Generate Prisma client (schema defined by build arg)
RUN npx prisma generate --schema=${PRISMA_SCHEMA}

# Build TypeScript
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
