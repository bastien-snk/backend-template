import { AppMode } from "@/systems/runtime/app-mode";
import type { RuntimeModeResolver } from "@/systems/runtime/mode-resolver/runtime-mode-resolver";

export class ArgRuntimeModeResolver implements RuntimeModeResolver {
    private readonly appModes = new Set<AppMode>(Object.values(AppMode));

    resolve(): AppMode | undefined {
        const cliMode = this.parseCliMode();
        if (cliMode === undefined) return undefined;

        if (!this.isAppMode(cliMode)) {
            throw new Error(
                `Invalid --mode value '${cliMode}'. Allowed values: ${this.allowedValues()}.`,
            );
        }

        return cliMode;
    }

    private isAppMode(mode: string): mode is AppMode {
        return this.appModes.has(mode as AppMode);
    }

    private allowedValues(): string {
        return Array.from(this.appModes).join(", ");
    }

    private parseCliMode(): string | undefined {
        for (let index = 0; index < Bun.argv.length; index += 1) {
            const argument = Bun.argv[index];

            if (argument.startsWith("--mode="))
                return argument.slice("--mode=".length);
            if (argument === "--mode") return Bun.argv[index + 1] ?? "";
        }

        return undefined;
    }
}
