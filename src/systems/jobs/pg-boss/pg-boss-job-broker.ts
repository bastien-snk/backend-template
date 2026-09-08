import type {
    JobBatchHandler,
    JobBroker,
    JobSendOptions,
    JobWorkOptions,
} from "@/systems/jobs/core/job-broker";
import PgBoss from "pg-boss";

export type PgBossJobBrokerOptions = {
    connectionString: string;
    schema: string;
    pollingInterval?: number;
    archiveCompletedAfter?: number;
    archiveFailedAfter?: number;
    expireIn?: number;
};

export class PgBossJobBroker implements JobBroker {
    private readonly boss: PgBoss;

    constructor(options: PgBossJobBrokerOptions) {
        this.boss = new PgBoss({
            connectionString: options.connectionString,
            schema: options.schema,
            pollingIntervalSeconds: options.pollingInterval,
            archiveCompletedAfterSeconds: options.archiveCompletedAfter,
            archiveFailedAfterSeconds: options.archiveFailedAfter,
            expireInSeconds: options.expireIn,
        });
    }

    async start(): Promise<void> {
        await this.boss.start();
    }

    async stop(): Promise<void> {
        await this.boss.stop();
    }

    async createQueue(name: string): Promise<void> {
        try {
            await this.boss.createQueue(name);
        } catch (err) {
            const errorCode = (err as { code?: string }).code;
            if (errorCode !== "23505") throw err;
        }
    }

    async send(
        name: string,
        data: object,
        options?: JobSendOptions,
    ): Promise<string | null> {
        return this.boss.send(name, data, options ?? {});
    }

    async work(
        name: string,
        options: JobWorkOptions,
        handler: JobBatchHandler,
    ): Promise<string> {
        return this.boss.work(name, options, handler);
    }

    async schedule(
        name: string,
        cron: string,
        data: object = {},
        options?: JobSendOptions,
    ): Promise<void> {
        await this.boss.schedule(name, cron, data, options ?? {});
    }
}
