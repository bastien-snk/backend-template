/**
 * System-level secret resolution contract.
 *
 * `ref` is an opaque logical key (for example: `alpaca/paper/main`).
 * Implementations resolve raw secret content without applying
 * provider-specific parsing or validation.
 */
export interface SecretManager {
    /** Stores a raw secret and returns its opaque logical reference. */
    create(value: string): Promise<string>;

    /**
     * Resolve a secret payload by logical reference.
     *
     * Returns raw secret content as string when available,
     * or `null` when the reference does not exist.
     */
    get(ref: string): Promise<string | null>;

    /** Removes a secret reference. It is idempotent when the reference is absent. */
    delete(ref: string): Promise<void>;
}
