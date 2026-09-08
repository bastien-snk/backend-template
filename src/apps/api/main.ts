import type { ApiPlugin, ApiRuntimeContext, Runtime } from "@/systems/runtime";
import { AppMode } from "@/systems/runtime";
import { LogLevel } from "@/systems/logger";
import {
    ActorContextPlugin,
    CorsPlugin,
    HttpErrorHandlerPlugin,
    HttpRequestLoggerPlugin,
    StaticAssetsPlugin,
} from "@/apps/api/plugin";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import type { ModuleManager } from "@/systems/module";
import type { ActorResolver } from "@/systems/authentication";

export class ApiRuntime implements Runtime<ApiRuntimeContext> {
    readonly mode = AppMode.API;
    readonly app = new Elysia();

    private readonly corsPlugin = new CorsPlugin();
    private readonly httpErrorHandlerPlugin = new HttpErrorHandlerPlugin();
    private readonly actorContextPlugin = new ActorContextPlugin();
    private readonly staticAssetsPlugin = new StaticAssetsPlugin();

    constructor(
        private readonly modules: ModuleManager,
        private readonly actorResolvers: readonly ActorResolver[] = [],
    ) {}

    async setup(context: ApiRuntimeContext): Promise<void> {
        const plugins: ApiPlugin[] = [
            this.corsPlugin,
            this.httpErrorHandlerPlugin,
            this.actorContextPlugin,
            this.staticAssetsPlugin,
            context.env.LOG_LEVEL === LogLevel.DEBUG
                ? new HttpRequestLoggerPlugin()
                : undefined,
        ].filter((plugin) => plugin !== undefined);

        for (const plugin of plugins) {
            await plugin.register(context);
        }
    }

    async start(context: ApiRuntimeContext): Promise<void> {
        this.app.use(
            openapi({
                path: "/openapi",
                provider: "scalar",
                scalar: {
                    hideModels: true,
                },
                documentation: {
                    info: {
                        title: "API",
                        version: "1.0.0",
                    },
                },
            }),
        );

        for (const resolver of this.actorResolvers) {
            this.actorContextPlugin.registerResolver(resolver);
        }

        this.app.listen(context.env.API_PORT);
        context.logger.info(`listening on ${context.env.API_PORT}`);
    }

    async stop(context: ApiRuntimeContext): Promise<void> {}
}
