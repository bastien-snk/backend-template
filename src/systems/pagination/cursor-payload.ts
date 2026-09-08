import type { SortField } from "@/systems/pagination/sort-field";

export type CursorPayload = {
    readonly sort: SortField[];
    readonly values: unknown[];
};
