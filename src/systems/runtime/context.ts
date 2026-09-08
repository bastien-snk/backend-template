import type { Env } from "@/env";
import type { DatabaseClient } from "@/systems/database";
import type { IntegrationEventBus, InternalEventBus } from "@/systems/event";
import type { JobBroker } from "@/systems/jobs";
import type { NatsConnectionManager } from "@/systems/messaging";
import type { Logger } from "@/systems/logger";
import type { SecretManager } from "@/systems/secrets";
import type { Elysia } from "elysia";
import { AppMode } from "@/systems/runtime/app-mode";

export interface RuntimeContext {
    mode: AppMode;
    env: Env;
    logger: Logger;
    db: DatabaseClient;
    internalEventBus: InternalEventBus;
    integrationEventBus: IntegrationEventBus;
    jobBroker?: JobBroker;
    nats?: NatsConnectionManager;
    secrets: SecretManager;
}

export interface ApiRuntimeContext extends RuntimeContext {
    mode: AppMode.API;
    app: Elysia;
}

export interface WsRuntimeContext extends RuntimeContext {
    mode: AppMode.WS;
    app: Elysia;
}

export interface WorkerRuntimeContext extends RuntimeContext {
    mode: AppMode.WORKER;
}

export type RuntimeModeContext =
    ApiRuntimeContext | WsRuntimeContext | WorkerRuntimeContext;
