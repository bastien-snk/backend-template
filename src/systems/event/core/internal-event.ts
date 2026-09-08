import type { Event, EventListener } from "@/systems/event/core/event";

export type InternalEvent<
    TType extends string = string,
    TPayload = unknown,
> = Event<TType, TPayload>;

export interface InternalEventListener<
    TEvent extends Event = Event,
> extends EventListener<TEvent> {}

export interface InternalEventPublisher {
    publish<TEvent extends InternalEvent>(event: TEvent): Promise<void>;
}

export interface InternalEventBus extends InternalEventPublisher {
    subscribe<TEvent extends InternalEvent>(
        eventType: TEvent["eventType"],
        listener: InternalEventListener<TEvent>,
    ): void;
}
