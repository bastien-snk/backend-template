import type { SeedRegistry } from "@/systems/seeding/seed-registry";
import type { SeedTask } from "@/systems/seeding/seed-task";

/**
 * Aggregates seed tasks from multiple module registries.
 *
 * The catalog itself is runtime-agnostic and only composes registries.
 */
export class SeedCatalog {
    private readonly registries: SeedRegistry[] = [];

    register(...registries: SeedRegistry[]): this {
        this.registries.push(...registries);
        return this;
    }

    getTasks(): SeedTask[] {
        return this.registries.flatMap((registry) => registry.getTasks());
    }
}
