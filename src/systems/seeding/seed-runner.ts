import { SeedPlanResolver } from "@/systems/seeding/seed-plan-resolver";
import type {
    SeedExecutionContext,
    SeedTask,
} from "@/systems/seeding/seed-task";

/** Executes seed tasks according to dependency order. */
export class SeedRunner {
    constructor(private readonly resolver: SeedPlanResolver) {}

    async run(tasks: SeedTask[], context: SeedExecutionContext): Promise<void> {
        const plan = this.resolver.resolve(tasks);
        for (const task of plan) {
            await task.run(context);
        }
    }
}
