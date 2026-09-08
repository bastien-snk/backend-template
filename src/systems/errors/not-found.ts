/**
 * Base error for resource not found scenarios.
 */
export class NotFoundError extends Error {
    readonly code: string;

    constructor(resource: string, identifier: string, code = "core.not_found") {
        super(`${resource} '${identifier}' not found`);
        this.name = "NotFoundError";
        this.code = code;
    }
}
