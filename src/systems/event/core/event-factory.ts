import type { Event } from "@/systems/event/core/event";
import type { IdGenerator } from "@/systems/id-generator";

export type CreateEventInput<TType extends string, TPayload> = {
    eventType: TType;
    payload: TPayload;
};

export interface EventFactory {
    create<TType extends string, TPayload>(
        input: CreateEventInput<TType, TPayload>,
    ): Event<TType, TPayload>;
}

export class DefaultEventFactory implements EventFactory {
    constructor(private readonly idGenerator: IdGenerator) {}

    create<TType extends string, TPayload>(
        input: CreateEventInput<TType, TPayload>,
    ): Event<TType, TPayload> {
        return {
            eventId: this.idGenerator.generate(),
            eventType: input.eventType,
            occurredAt: new Date(),
            payload: input.payload,
        };
    }
}
