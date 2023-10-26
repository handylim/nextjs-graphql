FROM node:20-alpine AS builder
LABEL stage=builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npm install --location=global pnpm && pnpm install --frozen-lockfile && pnpm run test:ci && pnpm run build


FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add -U tzdata
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000