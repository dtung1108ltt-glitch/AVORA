# Build stage
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy toàn bộ monorepo (cần pnpm-lock.yaml + pnpm-workspace.yaml ở gốc,
# vì docker-compose.yml build với context: . )
COPY . .

RUN pnpm install --frozen-lockfile

# Build package api-gateway (turbo tự build luôn @ai4a/shared vì là dependency)
RUN pnpm --filter @ai4a/api-gateway build

# Tách riêng package api-gateway + node_modules production-only ra thư mục độc lập
RUN pnpm --filter @ai4a/api-gateway deploy --prod /prod/api-gateway

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder /prod/api-gateway ./
# pnpm deploy đóng gói theo quy tắc kiểu .gitignore nên bỏ qua dist/ (build output, không commit git).
# Copy trực tiếp dist đã build ở stage builder để đảm bảo có mặt trong image production.
COPY --from=builder /app/services/api-gateway/dist ./dist

RUN chown -R nodejs:nodejs /app
USER nodejs

ENV PORT=4000
EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

CMD ["node", "dist/index.js"]
