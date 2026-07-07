# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./
COPY src/prisma src/prisma
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN pnpm install --no-frozen-lockfile --ignore-scripts

COPY . .

ARG NEXT_PUBLIC_API_BASE_URL=https://SEU_DOMINIO
ARG NEXT_PUBLIC_APP_URL=https://SEU_DOMINIO
ARG NEXTAUTH_URL=https://SEU_DOMINIO/api/auth
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=build-placeholder-not-used-at-runtime

RUN pnpm exec prisma generate && pnpm exec tsx src/assets/iconify-icons/bundle-icons-css.ts
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
ENV NODE_ENV=production

RUN addgroup -S catec && adduser -S catec -G catec

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/.npmrc ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./
COPY --from=build /app/src ./src

USER catec
EXPOSE 3000
CMD ["pnpm", "start"]
