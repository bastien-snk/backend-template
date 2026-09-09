import { describe, expect, test } from "bun:test";
import { isUniqueViolationError } from "@/systems/database";
import { DrizzleQueryError } from "drizzle-orm/errors";

describe("isUniqueViolationError", () => {
    const uniqueViolation = Object.assign(new Error("unique violation"), {
        code: "23505",
        table: "identities",
        constraint: "identities_player_id_unique",
    });

    test("recognizes a direct PostgreSQL unique violation", () => {
        expect(isUniqueViolationError(uniqueViolation)).toBe(true);
    });

    test("recognizes a Drizzle-wrapped PostgreSQL unique violation", () => {
        const error = new DrizzleQueryError(
            "insert into identities",
            [],
            uniqueViolation,
        );

        expect(isUniqueViolationError(error)).toBe(true);
    });

    test("matches a named constraint and table", () => {
        expect(
            isUniqueViolationError(uniqueViolation, {
                table: "identities",
                constraint: "identities_player_id_unique",
            }),
        ).toBe(true);
    });

    test("rejects a different constraint or table", () => {
        expect(
            isUniqueViolationError(uniqueViolation, {
                constraint: "identities_name_unique",
            }),
        ).toBe(false);
        expect(
            isUniqueViolationError(uniqueViolation, { table: "players" }),
        ).toBe(false);
    });

    test("rejects non-unique errors", () => {
        expect(isUniqueViolationError({ code: "23503" })).toBe(false);
        const foreignKeyViolation = Object.assign(new Error("foreign key"), {
            code: "23503",
        });
        const error = new DrizzleQueryError(
            "insert into identities",
            [],
            foreignKeyViolation,
        );

        expect(isUniqueViolationError(error)).toBe(false);
    });
});
