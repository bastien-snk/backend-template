import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { DatabaseClient } from "@/systems/database/database-client";
import type { DatabaseRuntime } from "@/systems/database/database-runtime";

type DrizzlePostgresDatabaseParams = {
    connectionString: string;
};

export class DrizzlePostgresDatabase implements DatabaseRuntime {
    private pool: Pool | null = null;
    private db: DatabaseClient | null = null;

    private readonly params: DrizzlePostgresDatabaseParams;

    constructor(params: DrizzlePostgresDatabaseParams) {
        this.params = params;
    }

    async start(): Promise<void> {
        if (this.db) return;

        this.pool = new Pool({
            connectionString: this.params.connectionString,
        });
        await this.pool.query("select 1");
        this.db = drizzle(this.pool);
    }

    async stop(): Promise<void> {
        if (!this.pool) return;

        await this.pool.end();
        this.db = null;
        this.pool = null;
    }

    getConnection(): DatabaseClient {
        if (!this.db) throw new Error("DrizzlePostgresDatabase is not started");

        return this.db;
    }
}
