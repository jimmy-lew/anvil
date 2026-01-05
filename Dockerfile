FROM node:25-trixie-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 1. Install curl (slim images don't have it)
RUN apt-get update && apt-get install -y curl ca-certificates && rm -rf /var/lib/apt/lists/*

# 2. Install pnpm via the standalone script
# This avoids the npm 'sizeCalculation' bug and the 'corepack not found' error
RUN curl -fsSL https://get.pnpm.io/install.sh | SHELL=bash sh -

# 3. Add pnpm to the PATH so it can be used in subsequent RUN commands
ENV PATH="/root/.local/share/pnpm:$PATH"

COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

# Expose ports
EXPOSE 3333

# Run the application
CMD [ "node", "dist/start.mjs" ]
