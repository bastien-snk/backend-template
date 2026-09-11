import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { idempotencyKeyHeaderSchema } from "@/systems/http";

const app = new Elysia().get("/", ({ headers }) => headers["idempotency-key"], {
    headers: idempotencyKeyHeaderSchema,
});

describe("idempotencyKeyHeaderSchema", () => {
    test("accepts a key containing the supported characters", async () => {
        const response = await app.handle(
            new Request("http://localhost/", {
                headers: { "idempotency-key": "order:42_payment-v1.0" },
            }),
        );

        expect(response.status).toBe(200);
        expect(await response.text()).toBe("order:42_payment-v1.0");
    });

    test("rejects a missing key", async () => {
        const response = await app.handle(new Request("http://localhost/"));

        expect(response.status).toBe(422);
    });

    test("rejects unsupported characters and keys over 255 characters", async () => {
        const invalidCharacterResponse = await app.handle(
            new Request("http://localhost/", {
                headers: { "idempotency-key": "order key" },
            }),
        );
        const tooLongResponse = await app.handle(
            new Request("http://localhost/", {
                headers: { "idempotency-key": "a".repeat(256) },
            }),
        );

        expect(invalidCharacterResponse.status).toBe(422);
        expect(tooLongResponse.status).toBe(422);
    });
});
