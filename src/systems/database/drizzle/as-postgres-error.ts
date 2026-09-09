export type PostgresError = {
    code: string;
    table?: string;
    constraint?: string;
};

/**
 * drizzle-orm puts the original driver error in `DrizzleQueryError.cause`.
 * Accept direct driver errors too, so callers can classify either form.
 */
export function asPostgresError(
    error: unknown,
    expectedCode: string,
): PostgresError | null {
    if (hasCode(error, expectedCode)) return error;

    const cause =
        typeof error === "object" && error !== null
            ? Reflect.get(error, "cause")
            : null;
    return hasCode(cause, expectedCode) ? cause : null;
}

function hasCode(error: unknown, expectedCode: string): error is PostgresError {
    return (
        typeof error === "object" &&
        error !== null &&
        Reflect.get(error, "code") === expectedCode
    );
}
