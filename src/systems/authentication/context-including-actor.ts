import type { Actor } from "@/systems/authentication/actor";

/** HTTP context enriched by the actor context plugin. */
export type ContextIncludingActor = {
    actor?: Actor | null;
};
