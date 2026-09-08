import type {createApi} from "@/apps/api/create-api";
import {AppMode} from "@/systems/runtime/app-mode";

export interface ApiRuntimeContext {
  readonly mode: AppMode.API;
  readonly http: ReturnType<typeof createApi>;
}

export type RuntimeContext = ApiRuntimeContext;
