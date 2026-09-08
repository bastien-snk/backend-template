import { AppMode } from "@/systems/runtime/app-mode";
import { ArgRuntimeModeResolver } from "@/systems/runtime/mode-resolver/arg-runtime-mode-resolver";
import { EnvRuntimeModeResolver } from "@/systems/runtime/mode-resolver/env-runtime-mode-resolver";
import type { RuntimeModeResolver } from "@/systems/runtime/mode-resolver/runtime-mode-resolver";

export class CompositeModeResolver implements RuntimeModeResolver {
    private readonly appModes = new Set<AppMode>(Object.values(AppMode));

    constructor(
        private readonly resolvers: RuntimeModeResolver[] = [
            new ArgRuntimeModeResolver(),
            new EnvRuntimeModeResolver(),
        ],
    ) {}

    resolve(): AppMode {
        for (const resolver of this.resolvers) {
            const mode = resolver.resolve();
            if (mode !== undefined) return mode;
        }

        throw new Error(
            `Missing app mode. Provide --mode=<${this.allowedPattern()}> or set MODE env var.`,
        );
    }

    private allowedPattern(): string {
        return Array.from(this.appModes).join("|");
    }
}
