import { DEFAULT_LIMIT, MAX_LIMIT } from "@/systems/pagination/constants";
import type { CursorPaginatorOptions } from "@/systems/pagination/cursor-paginator-options";
import type { CursorPayload } from "@/systems/pagination/cursor-payload";
import { InvalidCursorError } from "@/systems/pagination/errors/invalid-cursor";
import { SortDirection } from "@/systems/pagination/sort-direction";

export class CursorPaginator {
    private readonly maxLimit: number;
    private readonly defaultLimit: number;

    constructor(options?: CursorPaginatorOptions) {
        this.maxLimit = options?.maxLimit ?? MAX_LIMIT;
        this.defaultLimit = options?.defaultLimit ?? DEFAULT_LIMIT;
    }

    clampLimit(limit?: number | null): number {
        if (limit === undefined || limit === null) {
            return this.defaultLimit;
        }

        return Math.min(Math.max(Math.floor(limit), 1), this.maxLimit);
    }

    encodeCursor(payload: CursorPayload): string {
        return btoa(JSON.stringify(payload));
    }

    decodeCursor(cursor: string): CursorPayload {
        let json: string;
        try {
            json = atob(cursor);
        } catch {
            throw new InvalidCursorError("not a valid base64 string");
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(json);
        } catch {
            throw new InvalidCursorError("not valid JSON");
        }

        this.assertCursorPayload(parsed);

        return parsed;
    }

    private assertCursorPayload(
        value: unknown,
    ): asserts value is CursorPayload {
        if (typeof value !== "object" || value === null) {
            throw new InvalidCursorError("payload must be an object");
        }

        const obj = value as Record<string, unknown>;

        if (!Array.isArray(obj.sort)) {
            throw new InvalidCursorError("payload.sort must be an array");
        }

        if (!Array.isArray(obj.values)) {
            throw new InvalidCursorError("payload.values must be an array");
        }

        if (obj.sort.length !== obj.values.length) {
            throw new InvalidCursorError(
                "sort and values must have the same length",
            );
        }

        for (const entry of obj.sort) {
            if (typeof entry !== "object" || entry === null) {
                throw new InvalidCursorError(
                    "each sort entry must be an object",
                );
            }

            const sortEntry = entry as Record<string, unknown>;

            if (
                typeof sortEntry.field !== "string" ||
                sortEntry.field.length === 0
            ) {
                throw new InvalidCursorError(
                    "sort entry field must be a non-empty string",
                );
            }

            if (
                sortEntry.direction !== SortDirection.ASC &&
                sortEntry.direction !== SortDirection.DESC
            ) {
                throw new InvalidCursorError(
                    `sort entry direction must be "${SortDirection.ASC}" or "${SortDirection.DESC}"`,
                );
            }
        }
    }
}
