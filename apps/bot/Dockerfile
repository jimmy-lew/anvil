FROM node:25-alpine AS base

WORKDIR /app

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm@10.19.0

FROM base AS build

RUN pnpm install -g turbo@^2
COPY . .
RUN turbo prune @anvil/bot --docker

FROM base AS install

COPY --from=build /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=build /app/out/full/ .
RUN pnpm build

FROM base AS prod

COPY --from=install /app/apps/bot/dist /app/dist
COPY --from=install /app/apps/bot/config /app/config

CMD [ "node", "dist/start.mjs" ]
