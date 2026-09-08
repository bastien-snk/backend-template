import { HttpError, type ErrorResponseDetails } from "@/systems/http";

/**
 * 400 - Generic HTTP request params validation error.
 *
 * Error code: `http.invalid_request_params`
 * Details: `{ issues: [{ field, message }] }`
 */
export class InvalidRequestParamsError extends HttpError {
    constructor(details: ErrorResponseDetails) {
        super({
            status: 400,
            code: "http.invalid_request_params",
            message: "Invalid request params",
            details,
        });
        this.name = "InvalidRequestParamsError";
    }
}
