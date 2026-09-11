import { describe, expect, test } from "bun:test";
import {
    CursorPaginator,
    InvalidCursorError,
    SortDirection,
    type CursorPayload,
    type SortField,
} from "@/systems/pagination";

const expectedSort: SortField[] = [
    { field: "createdAt", direction: SortDirection.DESC },
    { field: "id", direction: SortDirection.DESC },
];

const cursor: CursorPayload = {
    sort: expectedSort,
    values: ["2026-09-11T12:00:00.000Z", "record-3"],
};

describe("CursorPaginator.assertSort", () => {
    const paginator = new CursorPaginator();

    test("accepts an absent cursor", () => {
        expect(() => paginator.assertSort(null, expectedSort)).not.toThrow();
    });

    test("accepts an identical canonical sort", () => {
        expect(() => paginator.assertSort(cursor, expectedSort)).not.toThrow();
    });

    test("rejects a sort with a different length", () => {
        expect(() =>
            paginator.assertSort(cursor, expectedSort.slice(0, 1)),
        ).toThrow(InvalidCursorError);
    });

    test("rejects a sort with a different field", () => {
        expect(() =>
            paginator.assertSort(cursor, [
                { field: "updatedAt", direction: SortDirection.DESC },
                { field: "id", direction: SortDirection.DESC },
            ]),
        ).toThrow(InvalidCursorError);
    });

    test("rejects a sort with a different direction", () => {
        expect(() =>
            paginator.assertSort(cursor, [
                { field: "createdAt", direction: SortDirection.ASC },
                { field: "id", direction: SortDirection.DESC },
            ]),
        ).toThrow(InvalidCursorError);
    });
});
