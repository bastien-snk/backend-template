import { describe, expect, test } from "bun:test";
import { sql } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core/dialect";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import {
    SortDirection,
    type CursorPayload,
    type SortField,
} from "@/systems/pagination";
import { DrizzleCursorApplier } from "@/systems/pagination/infrastructure/drizzle";

const records = pgTable("records", {
    id: text().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

const descendingSort: SortField[] = [
    { field: "createdAt", direction: SortDirection.DESC },
    { field: "id", direction: SortDirection.DESC },
];

const continuationCursor: CursorPayload = {
    sort: descendingSort,
    values: ["2026-09-11T12:00:00.000Z", "record-3"],
};

describe("DrizzleCursorApplier", () => {
    const applier = new DrizzleCursorApplier();
    const dialect = new PgDialect();

    test("builds a descending composite order", () => {
        const orderBy = applier.buildOrderBy(records, descendingSort);
        const query = dialect.sqlToQuery(sql`${orderBy[0]}, ${orderBy[1]}`);

        expect(query.sql).toBe(
            '"records"."created_at" desc, "records"."id" desc',
        );
    });

    test("builds the descending composite continuation predicate", () => {
        const where = applier.buildWhere(records, continuationCursor);

        expect(where).toBeDefined();

        const query = dialect.sqlToQuery(where!);

        expect(query.sql).toBe(
            '("records"."created_at" < $1 or ("records"."created_at" = $2 and "records"."id" < $3))',
        );
        expect(query.params).toEqual([
            "2026-09-11T12:00:00.000Z",
            "2026-09-11T12:00:00.000Z",
            "record-3",
        ]);
    });
});
