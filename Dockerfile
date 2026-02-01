FROM node:25-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm@10.19.0

WORKDIR /app

FROM base AS packages-deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/ ./packages/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM packages-deps AS packages-build
RUN pnpm --filter="@anvil/*" build

FROM base AS bot-deps
COPY --from=packages-build /app/packages ./packages
COPY apps/bot/package.json ./apps/bot/
COPY pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --shamefully-hoist
# Create symlinks for workspace packages manually since pnpm doesn't hoist them in this context, this is kind of hacky
# and im sure there's like a 10x better way to do this but im too lazy to figure it out rn
RUN mkdir -p /app/node_modules/@anvil && \
  ln -sf ../../packages/logger /app/node_modules/@anvil/logger && \
  ln -sf ../../packages/socket /app/node_modules/@anvil/socket && \
  ln -sf ../../packages/utils /app/node_modules/@anvil/utils

FROM bot-deps AS bot-build
COPY apps/bot ./apps/bot
RUN pnpm --filter @anvil/bot build

FROM base AS bot
COPY --from=packages-build /app/packages /app/packages
COPY --from=bot-build /app/apps/bot/dist /app/dist
COPY --from=bot-deps /app/node_modules /app/node_modules
COPY apps/bot/package.json /app/package.json
COPY apps/bot/config /app/config

EXPOSE 3333

CMD ["node", "dist/start.mjs"]

FROM base AS dashboard-deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/dashboard/ ./apps/dashboard/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --production --shamefully-hoist

FROM dashboard-deps AS dashboard-build
RUN pnpm --filter @anvil/dashboard build

FROM base AS dashboard
COPY --from=packages-build /app/packages /app/packages
COPY --from=dashboard-build /app/apps/dashboard/.output /app/.output
COPY --from=dashboard-deps /app/node_modules /app/node_modules
COPY apps/dashboard/package.json /app/package.json

ENV HOST=0.0.0.0
ENV PORT=4000
EXPOSE 4000
EXPOSE 9000

CMD ["node", ".output/server/index.mjs"]

FROM base AS docs-deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/docs/package.json ./apps/docs/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --production
COPY apps/docs/ ./apps/docs/

FROM docs-deps AS docs-build
RUN pnpm --filter @anvil/docs build

FROM base AS docs
COPY --from=packages-build /app/packages /app/packages
COPY --from=docs-build /app/apps/docs/.output /app/.output
COPY --from=docs-deps /app/node_modules /app/node_modules
COPY apps/docs/package.json /app/package.json

ENV HOST=0.0.0.0
ENV PORT=4001
EXPOSE 4001

CMD ["node", ".output/server/index.mjs"]
