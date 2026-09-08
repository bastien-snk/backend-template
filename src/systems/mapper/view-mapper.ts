/**
 * Generic mapper contract for in-process API views.
 *
 * Use this for `domain -> module api/view` mappings.
 */
export interface ViewMapper<Input, Output> {
    map(input: Input): Output;
}
