import type { SeedTask } from "@/systems/seeding/seed-task";

/**
 * Registry exposed by a module to contribute seed tasks.
 *
 * Each module owns its reference data and exposes a deterministic
 * set of tasks through this interface.
 */
export interface SeedRegistry {
    getTasks(): SeedTask[];
}
