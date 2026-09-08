import { cors } from "@elysiajs/cors";
import type { ApiPlugin, ApiRuntimeContext } from "@/systems/runtime";

export class CorsPlugin implements ApiPlugin {
    readonly key = "cors";

    register(context: ApiRuntimeContext): void {
        context.app.use(
            cors({
                credentials: true,
                origin: context.env.WEB_ORIGIN,
            }),
        );
    }
}
