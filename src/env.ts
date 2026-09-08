import { z } from "zod";
import { LogLevel } from "@/systems/logger";
import { AppMode } from "@/systems/runtime";
import { Environment } from "@/systems/environment";

const envSchema = z.object({
    ENV: z
        .enum(Environment)
        .default(Environment.DEVELOPMENT)
        .describe("Application environment."),
    DATABASE_URL: z.string().describe("Postgres connection string."),
    NATS_URL: z
        .url()
        .default("nats://localhost:4222")
        .describe("NATS server URL"),
    MODE: z
        .enum(AppMode)
        .optional()
        .describe("Optional runtime mode override."),
    API_PORT: z.coerce
        .number()
        .default(3000)
        .describe("HTTP API port for api mode."),
    WS_PORT: z.coerce
        .number()
        .default(3001)
        .describe("WebSocket port for websocket mode."),
    WEB_ORIGIN: z
        .url()
        .default("http://localhost:5173")
        .describe("Trusted public origin allowed by CORS."),
    LOG_LEVEL: z
        .enum(LogLevel)
        .default(LogLevel.INFO)
        .describe("Application log verbosity."),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(Bun.env);
