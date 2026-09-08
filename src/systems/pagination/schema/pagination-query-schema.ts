import { MAX_LIMIT } from "@/systems/pagination/constants";
import { t } from "elysia";
import type { Static } from "elysia";

export const paginationQuerySchema = t.Object({
    limit: t.Optional(t.Numeric({ minimum: 1, maximum: MAX_LIMIT })),
    cursor: t.Optional(t.String({ minLength: 1 })),
});

export type PaginationQuery = Static<typeof paginationQuerySchema>;
