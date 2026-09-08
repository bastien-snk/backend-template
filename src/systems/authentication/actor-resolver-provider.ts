import type { ActorResolver } from "@/systems/authentication/actor-resolver";

/** Technical authentication contribution available to the application composition root. */
export interface ActorResolverProvider {
    getActorResolver(): ActorResolver;
}
