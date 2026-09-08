import type { Logger } from "@/systems/logger";
import {
    connect,
    type JetStreamClient,
    type NatsConnection,
    type StreamConfig,
} from "nats";

export class NatsConnectionManager {
    private connection: NatsConnection | null = null;
    private jetStream: JetStreamClient | null = null;

    constructor(
        private readonly servers: string,
        private readonly logger: Logger,
    ) {}

    async start(): Promise<void> {
        this.connection = await connect({ servers: this.servers });
        this.jetStream = this.connection.jetstream();
        this.logger.info("NATS connected", { servers: this.servers });
    }

    getJetStream(): JetStreamClient {
        if (!this.jetStream) throw new Error("NATS is not started");
        return this.jetStream;
    }

    async registerStream(
        stream: Partial<StreamConfig> & Pick<StreamConfig, "name">,
    ): Promise<void> {
        if (!this.connection) throw new Error("NATS is not started");
        const manager = await this.connection.jetstreamManager();
        try {
            await manager.streams.info(stream.name);
        } catch {
            await manager.streams.add(stream);
        }
    }

    async stop(): Promise<void> {
        if (this.connection) await this.connection.drain();
        this.connection = null;
        this.jetStream = null;
    }
}
