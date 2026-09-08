import type {
    ApiRuntimeContext,
    RuntimeModeContext,
    WorkerRuntimeContext,
    WsRuntimeContext,
} from "@/systems/runtime";
import { AppMode } from "@/systems/runtime";
import type { ModuleDependencyResolver } from "@/systems/module/module-dependency-resolver";

/**
 * Base class for all application modules.
 *
 * Modules are the primary unit of domain logic. They are instantiated with the
 * shared application runtime and registered into a {@link ModuleManager}.
 *
 * Lifecycle (called by ModuleManager in registration order):
 *   1. `setup` — Set up the module: connect to services, register routes, etc.
 *   2. `start` — Begin active work: start servers, subscribe to queues, etc.
 *   3. `stop`  — Graceful shutdown (called in reverse registration order).
 */
export abstract class Module {
    abstract readonly name: string;

    readonly requires: readonly string[] = [];

    constructor(protected readonly context: RuntimeModeContext) {}

    /** Set up the module. Called once before `start`, in registration order. */
    abstract setup(dependencies: ModuleDependencyResolver): Promise<void>;

    /**
     * Begin active work. Called once after all modules have initialized.
     *
     * Default implementation dispatches by runtime mode, then runs shared hook.
     */
    async start(): Promise<void> {
        if (this.context.mode === AppMode.API) {
            await this.startApi(this.context);
        } else if (this.context.mode === AppMode.WS) {
            await this.startWs(this.context);
        } else {
            await this.startWorker(this.context);
        }

        await this.startShared();
    }

    /**
     * Gracefully shut down. Called in reverse registration order.
     *
     * Default implementation dispatches by runtime mode and always runs shared
     * cleanup hook.
     */
    async stop(): Promise<void> {
        try {
            if (this.context.mode === AppMode.API) {
                await this.stopApi(this.context);
            } else if (this.context.mode === AppMode.WS) {
                await this.stopWs(this.context);
            } else {
                await this.stopWorker(this.context);
            }
        } finally {
            await this.stopShared();
        }
    }

    protected async startApi(context: ApiRuntimeContext): Promise<void> {}

    protected async startWs(context: WsRuntimeContext): Promise<void> {}

    protected async startWorker(context: WorkerRuntimeContext): Promise<void> {}

    protected async startShared(): Promise<void> {}

    protected async stopApi(context: ApiRuntimeContext): Promise<void> {}

    protected async stopWs(context: WsRuntimeContext): Promise<void> {}

    protected async stopWorker(context: WorkerRuntimeContext): Promise<void> {}

    protected async stopShared(): Promise<void> {}
}
