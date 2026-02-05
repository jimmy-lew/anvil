FROM node:25-alpine AS base

WORKDIR /app

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm install -g pnpm@10.19.0 turbo@^2

FROM base AS build
COPY . .
RUN turbo prune @anvil/docs --docker

FROM base AS install

COPY --from=build /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=build /app/out/full/ .
RUN pnpm build

FROM base AS prod

COPY --from=install /app/apps/docs/.output /app/dist

ENV PORT=4001
EXPOSE 4001

CMD [ "node", "dist/server/index.mjs" ]
