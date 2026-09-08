import type { Event, EventListener } from "@/systems/event/core/event";

export type IntegrationEvent<
    TType extends string = string,
    TPayload = unknown,
> = Event<TType, TPayload>;

export interface IntegrationEventListener<
    TEvent extends Event = Event,
> extends EventListener<TEvent> {}

export interface IntegrationEventPublisher {
    publish<TEvent extends IntegrationEvent>(event: TEvent): Promise<void>;
}

export interface IntegrationEventBus extends IntegrationEventPublisher {
    subscribe<TEvent extends IntegrationEvent>(
        eventType: TEvent["eventType"],
        listener: IntegrationEventListener<TEvent>,
    ): void;
}
