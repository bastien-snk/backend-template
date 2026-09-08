import type { Runtime, WorkerRuntimeContext } from "@/systems/runtime";
import { AppMode } from "@/systems/runtime";

export class WorkerRuntime implements Runtime<WorkerRuntimeContext> {
    readonly mode = AppMode.WORKER;

    async setup(context: WorkerRuntimeContext): Promise<void> {}

    async start(context: WorkerRuntimeContext): Promise<void> {
        context.logger.info("ready");
    }

    async stop(context: WorkerRuntimeContext): Promise<void> {}
}
