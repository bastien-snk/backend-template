import { asPostgresError } from "@/systems/database/drizzle/as-postgres-error";

export type ForeignKeyViolationMatch = {
    /** Table the violated constraint lives on. Postgres always sets this for 23503. */
    table?: string;
    /** Exact constraint name. Only needed when a table has more than one FK to disambiguate. */
    constraint?: string;
};

export function isForeignKeyViolationError(
    error: unknown,
    match?: ForeignKeyViolationMatch,
): boolean {
    const pgError = asPostgresError(error, "23503");
    if (!pgError) return false;
    if (!match) return true;
    if (
        match.table !== undefined &&
        Reflect.get(pgError, "table") !== match.table
    )
        return false;
    if (
        match.constraint !== undefined &&
        Reflect.get(pgError, "constraint") !== match.constraint
    )
        return false;

    return true;
}
