import {drizzle, type NodePgDatabase} from "drizzle-orm/node-postgres";
import {Pool} from "pg";

export interface DatabaseConnection {
  readonly client: NodePgDatabase;
  close(): Promise<void>;
}

export function createDatabase(connectionString: string): DatabaseConnection {
  const pool = new Pool({connectionString});

  return {
    client: drizzle(pool),
    close: async () => pool.end(),
  };
}
