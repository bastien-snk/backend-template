/**
 * Generic boundary mapper contract.
 *
 * Use this for transport/view mappings (DTO -> HTTP response, etc.).
 */
export interface ResponseMapper<Input, Output> {
    map(input: Input): Output;
}
