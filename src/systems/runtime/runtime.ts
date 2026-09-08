import { AppMode } from "@/systems/runtime/app-mode";
import type { RuntimeModeContext } from "@/systems/runtime/context";

export interface Runtime<
    TRuntimeContext extends RuntimeModeContext = RuntimeModeContext,
> {
    mode: AppMode;

    setup(context: TRuntimeContext): Promise<void>;

    start(context: TRuntimeContext): Promise<void>;

    stop(context: TRuntimeContext): Promise<void>;
}
