import { asPostgresError } from "@/systems/database/drizzle/as-postgres-error";

export type UniqueViolationMatch = {
    /** Table the violated constraint lives on. */
    table?: string;
    /** Exact constraint name. Only needed when a table has multiple unique constraints. */
    constraint?: string;
};

export function isUniqueViolationError(
    error: unknown,
    match?: UniqueViolationMatch,
): boolean {
    const pgError = asPostgresError(error, "23505");
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
