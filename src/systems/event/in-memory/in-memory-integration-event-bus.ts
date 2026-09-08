import type { Logger } from "@/systems/logger";
import type {
    IntegrationEvent,
    IntegrationEventBus,
    IntegrationEventListener,
} from "@/systems/event/core/integration-event";

type RegisteredListener = {
    readonly listener: IntegrationEventListener;
};

export class InMemoryIntegrationEventBus implements IntegrationEventBus {
    private readonly listeners = new Map<string, RegisteredListener[]>();

    constructor(private readonly logger: Logger) {}

    subscribe<TEvent extends IntegrationEvent>(
        eventType: TEvent["eventType"],
        listener: IntegrationEventListener<TEvent>,
    ): void {
        const listeners = this.listeners.get(eventType) ?? [];
        const registration: RegisteredListener = {
            listener: listener as IntegrationEventListener,
        };

        listeners.push(registration);
        this.listeners.set(eventType, listeners);
    }

    async publish<TEvent extends IntegrationEvent>(
        event: TEvent,
    ): Promise<void> {
        const listeners = this.listeners.get(event.eventType) ?? [];

        this.logger.debug("integration event dispatch started", {
            eventId: event.eventId,
            eventType: event.eventType,
            listenerCount: listeners.length,
        });

        for (const entry of listeners) {
            try {
                await entry.listener.handle(event);
            } catch (error) {
                this.logger.error("integration event listener failed", {
                    eventId: event.eventId,
                    eventType: event.eventType,
                    error,
                });
            }
        }

        this.logger.debug("integration event dispatch completed", {
            eventId: event.eventId,
            eventType: event.eventType,
            listenerCount: listeners.length,
        });
    }
}
