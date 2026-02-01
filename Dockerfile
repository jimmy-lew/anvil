FROM node:25-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm@10.19.0

WORKDIR /app

# Bot stages
FROM base AS bot-deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/bot/package.json ./apps/bot/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM bot-deps AS bot-build
COPY apps/bot ./apps/bot
RUN pnpm --filter @anvil/bot build

FROM base AS bot
COPY --from=bot-build /app/apps/bot/dist /app/dist
COPY --from=bot-deps /app/node_modules /app/node_modules
COPY apps/bot/package.json /app/package.json

EXPOSE 3333

CMD ["node", "dist/start.mjs"]

# Dashboard stages - needs full source for nuxt prepare during install
FROM base AS dashboard-deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/ ./packages/
COPY apps/dashboard/ ./apps/dashboard/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM dashboard-deps AS dashboard-build
RUN pnpm --filter @anvil/dashboard build

FROM base AS dashboard
COPY --from=dashboard-build /app/apps/dashboard/.output /app/.output
COPY --from=dashboard-deps /app/node_modules /app/node_modules
COPY apps/dashboard/package.json /app/package.json

ENV HOST=0.0.0.0
ENV PORT=4000
EXPOSE 4000
EXPOSE 9000

CMD ["node", ".output/server/index.mjs"]

# Docs stages - needs .npmrc for shamefully-hoist
FROM base AS docs-deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/ ./packages/
COPY apps/docs/package.json ./apps/docs/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY apps/docs/ ./apps/docs/

FROM docs-deps AS docs-build
RUN pnpm --filter @anvil/docs build

FROM base AS docs
COPY --from=docs-build /app/apps/docs/.output /app/.output
COPY --from=docs-deps /app/node_modules /app/node_modules
COPY apps/docs/package.json /app/package.json

ENV HOST=0.0.0.0
ENV PORT=4001
EXPOSE 4001

CMD ["node", ".output/server/index.mjs"]
