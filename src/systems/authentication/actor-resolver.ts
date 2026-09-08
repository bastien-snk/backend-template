import type { Actor } from "@/systems/authentication/actor";

export type ResolveActorInput = {
    headers: Headers;
};

/** Resolves one authentication mechanism to a fully usable application actor. */
export interface ActorResolver {
    resolve(input: ResolveActorInput): Promise<Actor | null>;
}
