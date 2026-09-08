import type {Actor} from "@/systems/authentication/actor";
import type {ActorResolver} from "@/systems/authentication/actor-resolver";

export class ActorResolverRegistry {
  constructor(private readonly resolvers: readonly ActorResolver[]) {}

  async resolve(request: Request): Promise<Actor | null> {
    for (const resolver of this.resolvers) {
      const actor = await resolver.resolve(request);
      if (actor) {
        return actor;
      }
    }

    return null;
  }
}
