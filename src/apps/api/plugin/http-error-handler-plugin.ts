import { HttpError } from "@/systems/http";
import type { ApiPlugin } from "@/systems/runtime";
import type { ApiRuntimeContext } from "@/systems/runtime";
import { ValidationError } from "elysia";

export class HttpErrorHandlerPlugin implements ApiPlugin {
    readonly key = "http-error-handler";

    register(context: ApiRuntimeContext): void {
        context.app.onError((requestContext) => {
            if (requestContext.error instanceof HttpError) {
                requestContext.set.status = requestContext.error.status;
                return {
                    code: requestContext.error.code,
                    message: requestContext.error.message,
                    details: requestContext.error.details,
                };
            }

            if (requestContext.error instanceof ValidationError) {
                requestContext.set.status = 422;

                return {
                    code: "http.validation_error",
                    message: "Validation error",
                    details: {
                        errors: requestContext.error.all,
                    },
                };
            }

            requestContext.set.status = 500;
            const responseRequestId =
                requestContext.set.headers["x-request-id"];
            const requestId =
                typeof responseRequestId === "string"
                    ? responseRequestId
                    : (requestContext.request.headers.get("x-request-id") ??
                      undefined);
            const error = requestContext.error as {
                name?: string;
                message?: string;
                stack?: string;
            };

            context.logger.error("http request failed", {
                request_id: requestId,
                method: requestContext.request.method,
                url: requestContext.request.url,
                status: 500,
                code: "core.internal_error",
                message: "Internal server error",
                error: {
                    name: error?.name,
                    message: error?.message,
                    stack: error?.stack,
                },
            });

            return {
                code: "core.internal_error",
                message: "Internal server error",
            };
        });
    }
}
