import { ActorResolverRegistry } from "@/systems/authentication/actor-resolver-registry";
import type { ApiPlugin, ApiRuntimeContext } from "@/systems/runtime";
import { Elysia } from "elysia";
import { ActorResolver } from "@/systems/authentication";

/** Adds the resolved application actor to each HTTP request context. */
export class ActorContextPlugin implements ApiPlugin {
    readonly key = "actor-context";

    readonly registry = new ActorResolverRegistry();

    register(context: ApiRuntimeContext): void {
        context.app.use(
            new Elysia({ name: "actor-context" }).derive(
                { as: "scoped" },
                async (context) => ({
                    actor: await this.registry.resolve({
                        headers: context.request.headers,
                    }),
                }),
            ),
        );
    }

    registerResolver(resolver: ActorResolver) {
        this.registry.register(resolver);
    }
}
