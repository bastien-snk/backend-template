import { staticPlugin } from "@elysiajs/static";
import type { ApiPlugin, ApiRuntimeContext } from "@/systems/runtime";

/** Serves `assets/` under `/static`, e.g. provider logos referenced by relative path in API responses. */
export class StaticAssetsPlugin implements ApiPlugin {
    readonly key = "static-assets";

    async register(context: ApiRuntimeContext): Promise<void> {
        context.app.use(
            await staticPlugin({
                assets: "assets",
                prefix: "/static",
            }),
        );
    }
}
