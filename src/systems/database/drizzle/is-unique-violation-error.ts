export function isUniqueViolationError(error: unknown): boolean {
    if (typeof error !== "object" || error === null) return false;

    return Reflect.get(error, "code") === "23505";
}
