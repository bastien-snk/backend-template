import type { ApiRuntimeContext } from "@/systems/runtime/context";
import type { RuntimePlugin } from "@/systems/runtime/plugin/runtime-plugin";

export type ApiPlugin = RuntimePlugin<ApiRuntimeContext>;
