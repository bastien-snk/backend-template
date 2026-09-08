import {
    type Column,
    type SQL,
    type Table,
    and,
    asc,
    desc,
    eq,
    gt,
    lt,
    or,
} from "drizzle-orm";
import { getTableColumns } from "drizzle-orm/utils";
import type { CursorPayload } from "@/systems/pagination/cursor-payload";
import { SortDirection } from "@/systems/pagination/sort-direction";
import type { SortField } from "@/systems/pagination/sort-field";

export class DrizzleCursorApplier {
    buildOrderBy(table: Table, sort: SortField[]): SQL[] {
        const columns = getTableColumns(table);

        return sort.map((sortField) => {
            const column = this.resolveColumn(columns, sortField.field);

            return sortField.direction === SortDirection.ASC
                ? asc(column)
                : desc(column);
        });
    }

    buildWhere(table: Table, cursor: CursorPayload | null): SQL | undefined {
        if (cursor === null) {
            return undefined;
        }

        const columns = getTableColumns(table);
        const { sort, values } = cursor;

        if (sort.length !== values.length) {
            throw new Error(
                `Cursor sort/values length mismatch: ${sort.length} sort fields but ${values.length} values`,
            );
        }

        if (sort.length === 0) {
            return undefined;
        }

        const orClauses: SQL[] = [];

        for (let i = 0; i < sort.length; i++) {
            const eqParts: SQL[] = [];

            for (let j = 0; j < i; j++) {
                const col = this.resolveColumn(columns, sort[j].field);
                eqParts.push(eq(col, this.coerceValue(col, values[j])));
            }

            const col = this.resolveColumn(columns, sort[i].field);
            const comparator =
                sort[i].direction === SortDirection.ASC ? gt : lt;
            const strictPart = comparator(
                col,
                this.coerceValue(col, values[i]),
            );

            const clause =
                eqParts.length > 0 ? and(...eqParts, strictPart) : strictPart;

            if (clause) {
                orClauses.push(clause);
            }
        }

        return or(...orClauses);
    }

    private resolveColumn(
        columns: Record<string, Column>,
        field: string,
    ): Column {
        const column = columns[field];

        if (!column) {
            const available = Object.keys(columns).join(", ");
            throw new Error(
                `Unknown column "${field}" for cursor pagination. Available: ${available}`,
            );
        }

        return column;
    }

    private coerceValue(column: Column, value: unknown): unknown {
        if (column.dataType === "date" && typeof value === "string") {
            return new Date(value);
        }

        return value;
    }
}
