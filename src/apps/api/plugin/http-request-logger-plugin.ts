import type { ApiRuntimeContext } from "@/systems/runtime";
import type { ApiPlugin } from "@/systems/runtime";

enum HttpRequestStoreKey {
    StartedAt = "http_request_start_ms",
    RequestId = "http_request_id",
}

export class HttpRequestLoggerPlugin implements ApiPlugin {
    readonly key = "http-request-logger";

    register(context: ApiRuntimeContext): void {
        context.app.onRequest((requestContext) => {
            const store = requestContext.store as Record<string, unknown>;
            const requestId =
                requestContext.request.headers.get("x-request-id") ??
                crypto.randomUUID();
            const startedAt = Date.now();

            store[HttpRequestStoreKey.RequestId] = requestId;
            store[HttpRequestStoreKey.StartedAt] = startedAt;
            requestContext.set.headers["x-request-id"] = requestId;

            context.logger.debug("http request received", {
                request_id: requestId,
                method: requestContext.request.method,
                url: requestContext.request.url,
                headers: {
                    "content-type":
                        requestContext.request.headers.get("content-type"),
                    "x-forwarded-for":
                        requestContext.request.headers.get("x-forwarded-for"),
                    "user-agent":
                        requestContext.request.headers.get("user-agent"),
                    authorization: requestContext.request.headers.get(
                        "authorization",
                    )
                        ? "[REDACTED]"
                        : undefined,
                    cookie: requestContext.request.headers.get("cookie")
                        ? "[REDACTED]"
                        : undefined,
                },
            });
        });

        context.app.onAfterHandle((requestContext) => {
            const store = requestContext.store as Record<string, unknown>;
            const startedAtValue = store[HttpRequestStoreKey.StartedAt];
            const startedAt =
                typeof startedAtValue === "number" ? startedAtValue : undefined;
            const requestId =
                typeof store[HttpRequestStoreKey.RequestId] === "string"
                    ? store[HttpRequestStoreKey.RequestId]
                    : undefined;

            context.logger.debug("http response sent", {
                request_id: requestId,
                method: requestContext.request.method,
                url: requestContext.request.url,
                status: requestContext.set.status,
                duration_ms: startedAt ? Date.now() - startedAt : undefined,
            });
        });
    }
}
