import { AppMode } from "@/systems/runtime/app-mode";
import type { RuntimeModeResolver } from "@/systems/runtime/mode-resolver/runtime-mode-resolver";

export class EnvRuntimeModeResolver implements RuntimeModeResolver {
    private readonly appModes = new Set<AppMode>(Object.values(AppMode));

    resolve(): AppMode | undefined {
        const envMode = Bun.env.MODE;
        if (envMode === undefined) return undefined;

        if (!this.isAppMode(envMode)) {
            throw new Error(
                `Invalid MODE env value '${envMode}'. Allowed values: ${this.allowedValues()}.`,
            );
        }

        return envMode;
    }

    private isAppMode(mode: string): mode is AppMode {
        return this.appModes.has(mode as AppMode);
    }

    private allowedValues(): string {
        return Array.from(this.appModes).join(", ");
    }
}
