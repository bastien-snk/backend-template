import { HttpError, type ErrorResponseDetails } from "@/systems/http";

/**
 * 400 - Pagination `cursor` query param is invalid.
 *
 * Error code: `pagination.invalid_cursor`
 * Details: `{ issues: [{ field, message }] }`
 */
export class InvalidPaginationCursorError extends HttpError {
    constructor(details: ErrorResponseDetails) {
        super({
            status: 400,
            code: "pagination.invalid_cursor",
            message: "Invalid pagination cursor",
            details,
        });
        this.name = "InvalidPaginationCursorError";
    }
}
