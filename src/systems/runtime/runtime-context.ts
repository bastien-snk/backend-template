import type {Elysia} from "elysia";
import {AppMode} from "@/systems/runtime/app-mode";

export interface ApiRuntimeContext {
  readonly mode: AppMode.API;
  readonly http: Elysia;
}

export type RuntimeContext = ApiRuntimeContext;
