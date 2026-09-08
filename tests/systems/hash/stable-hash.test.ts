import { describe, expect, test } from "bun:test";
import { StableValueHasher } from "@/systems/hash";

describe("StableValueHasher", () => {
    test("produces the same hash for objects with different key order", () => {
        const hasher = new StableValueHasher();
        const left = hasher.hash({ b: 2, a: 1, nested: { d: 4, c: 3 } });
        const right = hasher.hash({ nested: { c: 3, d: 4 }, a: 1, b: 2 });

        expect(left).toBe(right);
    });

    test("produces a different hash when the payload changes", () => {
        const hasher = new StableValueHasher();
        const left = hasher.hash({ a: 1, b: 2 });
        const right = hasher.hash({ a: 1, b: 3 });

        expect(left).not.toBe(right);
    });
});
