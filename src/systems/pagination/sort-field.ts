import type { SortDirection } from "@/systems/pagination/sort-direction";

export type SortField = {
    readonly field: string;
    readonly direction: SortDirection;
};
