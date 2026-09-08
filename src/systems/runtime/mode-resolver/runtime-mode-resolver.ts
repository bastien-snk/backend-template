import type { AppMode } from "@/systems/runtime/app-mode";

export interface RuntimeModeResolver {
    resolve(): AppMode | undefined;
}
