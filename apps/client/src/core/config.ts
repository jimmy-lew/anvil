/**
 * Configuration loading module
 * Loads configuration from YAML file and merges with environment variables
 * Returns IO monad to handle side effects purely
 */

import * as fs from "node:fs";
import * as path from "node:path";
import yaml from "js-yaml";
import dotenv from "dotenv";
import type { BotConfig, EnvVars } from "./types.js";
import type { IO } from "../io/io.js";
import type { Either } from "../utils/either.js";
import { right, left } from "../utils/either.js";
import type { IOEither } from "../io/io-either.js";
import { flatMapIOEither, mapIOEither } from "../io/io-either.js";

/**
 * Load environment variables from .env file
 * Pure side effect wrapped in IOEither
 */
const loadEnvVars = (): IOEither<Error, EnvVars> =>
  () => {
    const result = dotenv.config();
    if (result.error) {
      return left(new Error(`Failed to load .env file: ${result.error.message}`));
    }

    const envVars: EnvVars = {
      BOT_TOKEN: process.env.BOT_TOKEN ?? "",
      DATABASE_URL: process.env.DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
      CLIENT_ID: process.env.CLIENT_ID,
      GUILD_ID: process.env.GUILD_ID,
      LOG_LEVEL: process.env.LOG_LEVEL,
      NODE_ENV: process.env.NODE_ENV ?? "development",
    };

    return right(envVars);
  };

/**
 * Load YAML configuration file
 * Pure side effect wrapped in IOEither
 */
const loadYamlConfig = (): IOEither<Error, BotConfig> =>
  () => {
    const configPath = path.resolve("config/config.yaml");

    try {
      const fileContents = fs.readFileSync(configPath, "utf8");
      const config = yaml.load(fileContents) as BotConfig;
      return right(config);
    } catch (error) {
      if (error instanceof Error) {
        return left(new Error(`Failed to load config.yaml: ${error.message}`));
      }
      return left(new Error("Failed to load config.yaml: Unknown error"));
    }
  };

/**
 * Validate that required configuration fields are present
 * Returns Left with error message if validation fails
 */
const validateEnvVars = (envVars: EnvVars): Either<Error, EnvVars> => {
  if (!envVars.BOT_TOKEN) {
    return left(new Error("BOT_TOKEN is required in .env file"));
  }
  return right(envVars);
};

/**
 * Merge YAML config with environment variable overrides
 * Environment variables take precedence for sensitive values
 */
const mergeConfig = (yamlConfig: BotConfig, envVars: EnvVars): BotConfig => ({
  ...yamlConfig,
  logLevel: (envVars.LOG_LEVEL as BotConfig["logLevel"]) ?? yamlConfig.logLevel,
});

/**
 * Load and validate the complete application configuration
 * Composes multiple IO operations into a single configuration loader
 */
export const loadConfig = (): IOEither<Error, BotConfig> => {
  const envIO = loadEnvVars();
  const yamlIO = loadYamlConfig();

  return flatMapIOEither(
    mapIOEither(envIO, (envVars) => ({ envVars, validated: validateEnvVars(envVars) })),
    ({ envVars, validated }) =>
      () => {
        if (validated._tag === "Left") {
          return validated;
        }
        const yamlResult = yamlIO();
        if (yamlResult._tag === "Left") {
          return yamlResult;
        }
        const mergedConfig = mergeConfig(yamlResult.right, envVars);
        return right(mergedConfig);
      }
  );
};

/**
 * Get a specific configuration value
 * Helper function for accessing nested config values
 */
export const getConfigValue = <K extends keyof BotConfig>(
  key: K
): IOEither<Error, BotConfig[K]> =>
  mapIOEither(loadConfig(), (config) => config[key]);

/**
 * Get environment variable value
 */
export const getEnvVar = (key: keyof EnvVars): IO<EnvVars[keyof EnvVars] | undefined> =>
  () => {
    const result = loadEnvVars()();
    if (result._tag === "Left") {
      return undefined;
    }
    return result.right[key];
  };
