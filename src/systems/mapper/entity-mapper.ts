export interface EntityMapper<T, U> {
    toEntity(dto: T): U;
}
