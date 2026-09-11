import { t } from "elysia";
import type { Static } from "elysia";

export const idempotencyKeyHeaderSchema = t.Object({
    "idempotency-key": t.String({
        minLength: 1,
        maxLength: 255,
        pattern: "^[A-Za-z0-9._:-]+$",
    }),
});

export type IdempotencyKeyHeader = Static<typeof idempotencyKeyHeaderSchema>;
