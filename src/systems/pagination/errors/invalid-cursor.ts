export class InvalidCursorError extends Error {
    readonly code = "pagination.invalid_cursor";

    constructor(reason: string) {
        super(`Invalid pagination cursor: ${reason}`);
        this.name = "InvalidCursorError";
    }
}
