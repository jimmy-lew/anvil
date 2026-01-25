# Anvil

A modern Discord bot monorepo with dashboard, built with TypeScript and managed by Turborepo.

## 🚀 Features

- **Discord Bot**: Feature-rich bot built with Discord.js
- **Web Dashboard**: Modern dashboard built with Nuxt.js
- **Monorepo Architecture**: Organized with Turborepo and pnpm workspaces
- **TypeScript**: Full TypeScript support across all packages
- **Database**: Drizzle ORM with LibSQL
- **Authentication**: Better Auth integration
- **Real-time**: Socket.io support
- **Testing**: Vitest for unit testing
- **Code Quality**: ESLint with @antfu/eslint-config

## 📁 Project Structure

```
anvil/
├── apps/
│   ├── bot/           # Discord Bot Application
│   └── dashboard/     # Web Dashboard (Nuxt)
├── packages/
│   ├── logger/        # Logging utility (@anvil/logger)
│   ├── socket/        # Socket utilities (@anvil/socket)
│   └── utils/         # Common utilities (@anvil/utils)
├── package.json       # Root workspace config
├── pnpm-workspace.yaml # Workspace definitions
├── turbo.json         # Turborepo task config
└── tsconfig.base.json # Shared TypeScript config
```

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd anvil

# Install dependencies
pnpm install

# Build the Go CLI (optional)
pnpm anvil:build
```

## 🏃‍♂️ Getting Started

### Using the Go CLI (Recommended)

```bash
# Interactive terminal UI for managing applications
pnpm anvil

# Build CLI first if not built
pnpm anvil:build && pnpm anvil
```

### Traditional Development

```bash
# Start all applications in development mode
pnpm dev

# Start specific application
pnpm --filter @anvil/bot dev
pnpm --filter @anvil/dashboard dev
```

### Build

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @anvil/bot build
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @anvil/bot test

# Run tests in watch mode
pnpm --filter @anvil/bot test:watch

# Run coverage
pnpm --filter @anvil/bot test:coverage
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific package
pnpm --filter @anvil/bot lint
```

## 📦 Packages

### @anvil/bot
Discord bot application with command handling, rate limiting, and database integration.

### @anvil/dashboard
Web dashboard built with Nuxt.js for bot management and monitoring.

### @anvil/logger
Shared logging utility across the monorepo.

### @anvil/socket
Socket.io utilities for real-time communication.

### @anvil/utils
Common utilities and helper functions.

## 🛠️ Tech Stack

- **Runtime**: Node.js >=25.0.0
- **Package Manager**: pnpm
- **Build Tool**: Turborepo
- **Language**: TypeScript
- **Bot Framework**: Discord.js
- **Web Framework**: Nuxt.js
- **Database**: LibSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Testing**: Vitest
- **Linting**: ESLint with @antfu/eslint-config

## 📝 Environment Variables

Create `.env` files in the respective app directories:

### Bot (.env)
```
DISCORD_TOKEN=your_discord_token
DATABASE_URL=your_database_url
```

### Dashboard (.env)
```
DATABASE_URL=your_database_url
AUTH_SECRET=your_auth_secret
```

## 🐳 Docker

```bash
# Build bot image
cd apps/bot
pnpm build:docker

# Run bot container
pnpm start:docker

# Stop bot container
pnpm stop:docker
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Jimmy Lew**
- Email: jvnu@proton.me
- GitHub: [@jimmy-lew](https://github.com/jimmy-lew)