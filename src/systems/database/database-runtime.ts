import type { DatabaseClient } from "@/systems/database/database-client";

export interface DatabaseRuntime {
    start(): Promise<void>;

    stop(): Promise<void>;

    getConnection(): DatabaseClient;
}
