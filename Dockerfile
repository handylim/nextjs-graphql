FROM node:22-alpine AS builder
LABEL stage=builder
WORKDIR /app
COPY . .
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    corepack prepare pnpm@10.5.2 --activate &&  \
    pnpm install --frozen-lockfile &&  \
    pnpm run test:ci &&  \
    pnpm run build


FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add -U tzdata && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000