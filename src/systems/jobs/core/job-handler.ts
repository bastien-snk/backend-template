export interface JobHandler<TPayload> {
    handle(payload: TPayload): Promise<void>;
}
