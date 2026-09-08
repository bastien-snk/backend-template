export type Page<T> = {
    readonly data: T[];
    readonly nextCursor: string | null;
    readonly hasMore: boolean;
};
