# Anvil

Anvil is the primary discord bot for The Pole and Axe Smithy.

## Features

-   **Dynamic Command Handling:** Commands are automatically loaded from the `src/commands` directory.
-   **Event Handling:** Event handlers for various Discord events are located in the `src/events` directory.
-   **Configuration:** The bot is configured using a `config.yaml` file.
-   **Logging:** Uses Pino for logging, with an exposed server to consume logs as SSEs.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v24.0.0 or higher)
-   [pnpm](https://pnpm.io/) (v10.19.0 or higher)

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
3.  Create a `config.yaml` file in the `config` directory. See the [Configuration](#configuration) section for more details.

## Usage

To start the bot, run the following command:

```bash
pnpm start
```

For development, you can use the following command to build the project:

```bash
pnpm build
```

## Configuration

The bot is configured using a `config.yaml` file located in the `config` directory. Here is an example configuration:

```yaml
env: dev
developers:
  - "YOUR_DISCORD_USER_ID"
client:
  id: "YOUR_BOT_CLIENT_ID"
  token: "YOUR_BOT_TOKEN"
  intents:
    - "Guilds"
    - "GuildMessages"
    - "MessageContent"
  partials:
    - "Channel"
  caches:
    ReactionManager: 0
    MessageManager:
      maxSize: 200
      sweepInterval: 300
logging:
  webhookURL: "YOUR_DISCORD_WEBHOOK_URL"
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
