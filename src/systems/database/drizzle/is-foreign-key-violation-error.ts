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
    const pgError = asPgError(error);
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

/**
 * drizzle-orm wraps every driver error in `DrizzleQueryError`, moving the
 * original `pg` error (which carries `code`/`table`/`constraint`) to `.cause`
 * instead of copying those fields onto itself. Unwrap one level so callers
 * can match on the real Postgres error regardless of which one they receive.
 */
function asPgError(error: unknown): object | null {
    if (
        typeof error === "object" &&
        error !== null &&
        Reflect.get(error, "code") === "23503"
    )
        return error;

    const cause =
        typeof error === "object" && error !== null
            ? Reflect.get(error, "cause")
            : null;
    if (
        typeof cause === "object" &&
        cause !== null &&
        Reflect.get(cause, "code") === "23503"
    )
        return cause;

    return null;
}
