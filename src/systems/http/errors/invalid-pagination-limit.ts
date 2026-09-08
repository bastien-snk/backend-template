import { HttpError, type ErrorResponseDetails } from "@/systems/http";

/**
 * 400 - Pagination `limit` query param is invalid.
 *
 * Error code: `pagination.invalid_limit`
 * Details: `{ issues: [{ field, message }] }`
 */
export class InvalidPaginationLimitError extends HttpError {
    constructor(details: ErrorResponseDetails) {
        super({
            status: 400,
            code: "pagination.invalid_limit",
            message: "Invalid pagination limit",
            details,
        });
        this.name = "InvalidPaginationLimitError";
    }
}
