import type { RuntimeModeContext } from "@/systems/runtime/context";

export interface RuntimePlugin<
    TRuntimeContext extends RuntimeModeContext = RuntimeModeContext,
> {
    key: string;

    register(context: TRuntimeContext): void | Promise<void>;
}
