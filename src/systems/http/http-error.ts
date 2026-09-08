export type ErrorResponseDetails = {
    issues: Array<{
        field: string;
        message: string;
    }>;
};

export type ErrorResponse = {
    status: number;
    code: string;
    message: string;
    details?: ErrorResponseDetails;
};

/**
 * Transport-level HTTP error.
 *
 * Must only be thrown by infrastructure HTTP adapters.
 */
export class HttpError extends Error {
    readonly status: number;
    readonly code: string;
    readonly details?: ErrorResponseDetails;

    constructor(params: {
        status: number;
        code: string;
        message: string;
        details?: ErrorResponseDetails;
    }) {
        super(params.message);
        this.name = "HttpError";
        this.status = params.status;
        this.code = params.code;
        this.details = params.details;
    }
}
