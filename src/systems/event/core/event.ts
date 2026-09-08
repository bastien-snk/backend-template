export type Event<TType extends string = string, TPayload = unknown> = {
    eventId: string;
    eventType: TType;
    occurredAt: Date;
    payload: TPayload;
};

export interface EventListener<TEvent extends Event = Event> {
    handle(event: TEvent): Promise<void> | void;
}
