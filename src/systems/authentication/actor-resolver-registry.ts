import type { Actor } from "@/systems/authentication/actor";
import type {
    ActorResolver,
    ResolveActorInput,
} from "@/systems/authentication/actor-resolver";

/**
 * Aggregates independently registered actor resolvers without depending on
 * the modules that implement user or bot authentication.
 */
export class ActorResolverRegistry {
    private readonly resolvers: ActorResolver[];

    constructor(resolvers: ActorResolver[] = []) {
        this.resolvers = resolvers;
    }

    register(resolver: ActorResolver): void {
        this.resolvers.push(resolver);
    }

    async resolve(input: ResolveActorInput): Promise<Actor | null> {
        for (const resolver of this.resolvers) {
            const actor = await resolver.resolve(input);
            if (actor) return actor;
        }

        return null;
    }
}
