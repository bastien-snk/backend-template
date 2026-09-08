import pino, { type Logger as PinoInstance, type LoggerOptions } from "pino";
import type { Logger } from "@/systems/logger/logger";

type PinoLoggerParams = {
    options?: LoggerOptions;
    instance?: PinoInstance;
};

export class PinoLogger implements Logger {
    private readonly logger: PinoInstance;

    constructor(params: PinoLoggerParams = {}) {
        if (params.instance) {
            this.logger = params.instance;
            return;
        }

        this.logger = pino(params.options ?? {});
    }

    debug(message: string, meta?: unknown): void {
        this.logger.debug(this.normalizeMeta(meta), message);
    }

    info(message: string, meta?: unknown): void {
        this.logger.info(this.normalizeMeta(meta), message);
    }

    warn(message: string, meta?: unknown): void {
        this.logger.warn(this.normalizeMeta(meta), message);
    }

    error(message: string, meta?: unknown): void {
        this.logger.error(this.normalizeMeta(meta), message);
    }

    child(bindings: Record<string, unknown>): Logger {
        return new PinoLogger({ instance: this.logger.child(bindings) });
    }

    private normalizeMeta(meta: unknown): Record<string, unknown> {
        if (meta === undefined || meta === null) {
            return {};
        }

        if (typeof meta === "object") {
            return meta as Record<string, unknown>;
        }

        return { value: meta };
    }
}
