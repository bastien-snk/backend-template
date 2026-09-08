import type { DatabaseClient } from "@/systems/database";

/** Runtime context shared by seed tasks. */
export interface SeedExecutionContext {
    db: DatabaseClient;
}

/**
 * Unit of seeding work.
 *
 * `dependsOn` declares prerequisite task ids.
 */
export interface SeedTask {
    id: string;
    dependsOn: string[];

    run(context: SeedExecutionContext): Promise<void>;
}
