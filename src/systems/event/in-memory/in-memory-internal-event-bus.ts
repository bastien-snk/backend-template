import type { Logger } from "@/systems/logger";
import type {
    InternalEvent,
    InternalEventBus,
    InternalEventListener,
} from "@/systems/event/core/internal-event";

type RegisteredListener = {
    readonly listener: InternalEventListener;
};

export class InMemoryInternalEventBus implements InternalEventBus {
    private readonly listeners = new Map<string, RegisteredListener[]>();

    constructor(private readonly logger: Logger) {}

    subscribe<TEvent extends InternalEvent>(
        eventType: TEvent["eventType"],
        listener: InternalEventListener<TEvent>,
    ): void {
        const listeners = this.listeners.get(eventType) ?? [];
        const registration: RegisteredListener = {
            listener: listener as InternalEventListener,
        };

        listeners.push(registration);
        this.listeners.set(eventType, listeners);
    }

    async publish<TEvent extends InternalEvent>(event: TEvent): Promise<void> {
        const listeners = this.listeners.get(event.eventType) ?? [];

        this.logger.debug("application event dispatch started", {
            eventId: event.eventId,
            eventType: event.eventType,
            listenerCount: listeners.length,
        });

        for (const entry of listeners) {
            try {
                await entry.listener.handle(event);
            } catch (error) {
                this.logger.error("application event listener failed", {
                    eventId: event.eventId,
                    eventType: event.eventType,
                    error,
                });
            }
        }

        this.logger.debug("application event dispatch completed", {
            eventId: event.eventId,
            eventType: event.eventType,
            listenerCount: listeners.length,
        });
    }
}
