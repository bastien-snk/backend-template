import { env } from "@/env";
import { ApiRuntime } from "@/apps/api/main";
import { WorkerRuntime } from "@/apps/worker/main";
import { WsRuntime } from "@/apps/ws/main";
import type { DatabaseRuntime } from "@/systems/database";
import { DrizzlePostgresDatabase } from "@/systems/database";
import {
    InMemoryIntegrationEventBus,
    InMemoryInternalEventBus,
} from "@/systems/event";
import { PgBossJobBroker } from "@/systems/jobs";
import { JobsConfigSchema } from "@/systems/jobs/config/jobs-config";
import type { Logger } from "@/systems/logger";
import { PinoLogger } from "@/systems/logger";
import { ModuleManager } from "@/systems/module";
import { NatsConnectionManager } from "@/systems/messaging";
import type { SecretManager } from "@/systems/secrets";
import { LocalFileSecretManager } from "@/systems/secrets";
import type { RuntimeModeContext } from "@/systems/runtime";
import { AppMode } from "@/systems/runtime";

export class Application {
    private mode!: AppMode;
    private runtime!: ApiRuntime | WsRuntime | WorkerRuntime;
    private context!: RuntimeModeContext;
    private moduleManager!: ModuleManager;

    private logger!: Logger;
    private database!: DatabaseRuntime;
    private internalEventBus!: InMemoryInternalEventBus;
    private integrationEventBus!: InMemoryIntegrationEventBus;
    private jobBroker!: PgBossJobBroker;
    private nats!: NatsConnectionManager;
    private secrets!: SecretManager;

    constructor(mode: AppMode) {
        this.mode = mode;
    }

    async start(): Promise<void> {
        this.logger = new PinoLogger({
            options: {
                level: env.LOG_LEVEL,
                transport: {
                    target: "pino-pretty",
                    options: {
                        colorize: true,
                        translateTime: "HH:MM:ss.l",
                    },
                },
                base: {
                    service: "backend",
                    mode: this.mode,
                },
            },
        });

        this.database = new DrizzlePostgresDatabase({
            connectionString: env.DATABASE_URL,
        });
        await this.database.start();

        this.internalEventBus = new InMemoryInternalEventBus(
            this.logger.child({
                system: "event",
                transport: "in-memory",
                visibility: "internal",
            }),
        );
        this.integrationEventBus = new InMemoryIntegrationEventBus(
            this.logger.child({
                system: "event",
                transport: "in-memory",
                visibility: "integration",
            }),
        );

        const jobsConfig = JobsConfigSchema.parse({});
        this.jobBroker = new PgBossJobBroker({
            connectionString: env.DATABASE_URL,
            schema: "pgboss",
            pollingInterval: jobsConfig.pollingInterval,
            archiveCompletedAfter: jobsConfig.archiveCompletedAfter,
            archiveFailedAfter: jobsConfig.archiveFailedAfter,
            expireIn: jobsConfig.expireIn,
        });
        await this.jobBroker.start();

        this.nats = new NatsConnectionManager(
            env.NATS_URL,
            this.logger.child({ system: "messaging", transport: "nats" }),
        );
        await this.nats.start();

        this.secrets = new LocalFileSecretManager({
            logger: this.logger.child({
                system: "secrets",
                provider: "local-file",
            }),
        });

        this.moduleManager = new ModuleManager(this.logger);
        this.runtime = this.selectRuntime();
        this.context = this.buildContext();

        await this.setupRuntime();
        await this.moduleManager.setupAll();
        await this.moduleManager.start();
        await this.startRuntime();
    }

    async stop(): Promise<void> {
        this.context.logger.info("shutting down");
        await this.moduleManager.stop();
        await this.stopRuntime();
        await this.jobBroker.stop();
        await this.nats.stop();
        await this.database.stop();
    }

    private selectRuntime(): ApiRuntime | WsRuntime | WorkerRuntime {
        switch (this.mode) {
            case AppMode.API:
                return new ApiRuntime(this.moduleManager);
            case AppMode.WS:
                return new WsRuntime();
            default:
                return new WorkerRuntime();
        }
    }

    private buildContext(): RuntimeModeContext {
        const database = this.database.getConnection();
        if (this.runtime instanceof ApiRuntime) {
            return {
                mode: AppMode.API,
                env: env,
                logger: this.logger,
                db: database,
                internalEventBus: this.internalEventBus,
                integrationEventBus: this.integrationEventBus,
                jobBroker: this.jobBroker,
                nats: this.nats,
                secrets: this.secrets,
                app: this.runtime.app,
            };
        } else if (this.runtime instanceof WsRuntime) {
            return {
                mode: AppMode.WS,
                env: env,
                logger: this.logger,
                db: database,
                internalEventBus: this.internalEventBus,
                integrationEventBus: this.integrationEventBus,
                jobBroker: this.jobBroker,
                nats: this.nats,
                secrets: this.secrets,
                app: this.runtime.app,
            };
        } else {
            return {
                mode: AppMode.WORKER,
                env: env,
                logger: this.logger,
                db: database,
                internalEventBus: this.internalEventBus,
                integrationEventBus: this.integrationEventBus,
                jobBroker: this.jobBroker,
                nats: this.nats,
                secrets: this.secrets,
            };
        }
    }

    private async setupRuntime(): Promise<void> {
        if (
            this.runtime instanceof ApiRuntime &&
            this.context.mode === AppMode.API
        ) {
            await this.runtime.setup(this.context);
        } else if (
            this.runtime instanceof WsRuntime &&
            this.context.mode === AppMode.WS
        ) {
            await this.runtime.setup(this.context);
        } else if (
            this.runtime instanceof WorkerRuntime &&
            this.context.mode === AppMode.WORKER
        ) {
            await this.runtime.setup(this.context);
        } else {
            throw new Error("Runtime and context mismatch");
        }
    }

    private async startRuntime(): Promise<void> {
        if (
            this.runtime instanceof ApiRuntime &&
            this.context.mode === AppMode.API
        ) {
            await this.runtime.start(this.context);
        } else if (
            this.runtime instanceof WsRuntime &&
            this.context.mode === AppMode.WS
        ) {
            await this.runtime.start(this.context);
        } else if (
            this.runtime instanceof WorkerRuntime &&
            this.context.mode === AppMode.WORKER
        ) {
            await this.runtime.start(this.context);
        } else {
            throw new Error("Runtime and context mismatch");
        }
    }

    private async stopRuntime(): Promise<void> {
        if (
            this.runtime instanceof ApiRuntime &&
            this.context.mode === AppMode.API
        ) {
            await this.runtime.stop(this.context);
        } else if (
            this.runtime instanceof WsRuntime &&
            this.context.mode === AppMode.WS
        ) {
            await this.runtime.stop(this.context);
        } else if (
            this.runtime instanceof WorkerRuntime &&
            this.context.mode === AppMode.WORKER
        ) {
            await this.runtime.stop(this.context);
        } else {
            throw new Error("Runtime and context mismatch");
        }
    }
}
