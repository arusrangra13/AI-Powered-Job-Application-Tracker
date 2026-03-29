FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache libc6-compat && npm ci --only=production && npx prisma generate
COPY . .

EXPOSE 5000
CMD ["node", "src/app.js"]
