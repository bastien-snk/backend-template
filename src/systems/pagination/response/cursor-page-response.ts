export type CursorPageResponse<T> = {
    data: T[];
    next_cursor: string | null;
    has_more: boolean;
};
