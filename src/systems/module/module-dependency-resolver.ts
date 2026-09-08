import type { Module } from "@/systems/module/module";

export interface ModuleDependencyResolver {
    resolve<TModule extends Module>(moduleId: string): TModule;
}
