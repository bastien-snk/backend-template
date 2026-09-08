import type { Runtime, WsRuntimeContext } from "@/systems/runtime";
import { AppMode } from "@/systems/runtime";
import { Elysia } from "elysia";

export class WsRuntime implements Runtime<WsRuntimeContext> {
    readonly mode = AppMode.WS;
    readonly app = new Elysia();

    async setup(context: WsRuntimeContext): Promise<void> {}

    async start(context: WsRuntimeContext): Promise<void> {
        this.app.listen(context.env.WS_PORT);
        context.logger.info(`listening on ${context.env.WS_PORT}`);
    }

    async stop(context: WsRuntimeContext): Promise<void> {}
}
