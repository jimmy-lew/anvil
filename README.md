# Anvil

Anvil is the primary Discord bot for The Pole and Axe Smithy, built with [Discord.js](https://discord.js.org/) and TypeScript.

## Features

- **Dynamic Command Handling:** Commands are automatically loaded from the `src/commands` directory.
- **Event Handling:** Event handlers for various Discord events are located in the `src/events` directory.
- **Worker Thread Logging:** Uses a dedicated worker thread (`src/logger/worker.ts`) for non-blocking logging with Pino.
- **Live Log Streaming:** Exposes a Server-Sent Events (SSE) endpoint (default port 3333) to consume logs in real-time.
- **Configuration:** Centralized configuration using `config.yaml`.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v25.0.0 or higher)
- [pnpm](https://pnpm.io/) (v10.19.0 or higher)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/anvil.git
    cd anvil
    ```
2.  Install the dependencies:
    ```bash
    pnpm install
    ```
3.  Create a `config.yaml` file in the `config` directory.

### Configuration

The bot is configured using a `config.yaml` file located in the `config` directory.

**Example `config/config.yaml`:**

```yaml
env: dev
client:
  id: YOUR_BOT_CLIENT_ID
  token: YOUR_BOT_TOKEN
  intents:
    - Guilds
    - GuildMessages
    - MessageContent
  partials:
    - Channel
  caches:
    ReactionManager: 0
    MessageManager:
      maxSize: 200
      sweepInterval: 300
logging:
  sse:
    port: 3333
    route: /
```

## Project Structure

```
.
├── src/
│   ├── commands/      # Bot commands
│   ├── events/        # Event handlers
│   ├── logger/        # Logging configuration
│   ├── models/        # Bot model
│   ├── services/      # Services like command registry
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── config/
│   └── config.yaml    # Bot configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Project metadata and dependencies
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
