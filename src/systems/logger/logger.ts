/**
 * Application logger contract.
 *
 * This interface is intentionally library-agnostic, so runtime and module code
 * does not depend on a specific logger implementation (Pino, Winston, etc.).
 */
export interface Logger {
    /**
     * Writes a debug-level log message.
     *
     * @param message Human-readable log message.
     * @param meta Optional structured context attached to the log record.
     */
    debug(message: string, meta?: unknown): void;

    /**
     * Writes an info-level log message.
     *
     * @param message Human-readable log message.
     * @param meta Optional structured context attached to the log record.
     */
    info(message: string, meta?: unknown): void;

    /**
     * Writes a warning-level log message.
     *
     * @param message Human-readable log message.
     * @param meta Optional structured context attached to the log record.
     */
    warn(message: string, meta?: unknown): void;

    /**
     * Writes an error-level log message.
     *
     * @param message Human-readable log message.
     * @param meta Optional structured context attached to the log record.
     */
    error(message: string, meta?: unknown): void;

    /**
     * Creates a child logger with static bindings included in all subsequent
     * records written via the child.
     *
     * Typical use: add module, request, or correlation identifiers.
     */
    child(bindings: Record<string, unknown>): Logger;
}
