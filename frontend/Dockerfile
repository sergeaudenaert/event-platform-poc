FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
# Exclude cypress or anything failing, but just standard install
RUN npm ci

COPY . .
RUN npm run build || (echo "Build failed" && exit 1)

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:4000/api
# Wait, let's use the external API URL variable if provided, or fallback

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
