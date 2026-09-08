import type {Logger} from "@/systems/logging";
import {Module, type ModuleDependencyResolver} from "@/systems/module/module";

export class ModuleManager implements ModuleDependencyResolver {
  private readonly modules: Module[] = [];
  private readonly modulesByName = new Map<string, Module>();

  constructor(private readonly logger: Logger) {}

  register(...modules: Module[]): this {
    for (const module of modules) {
      if (this.modulesByName.has(module.name)) {
        throw new Error(`module '${module.name}' is already registered`);
      }

      const missing = module.requires.filter((name) => !this.modulesByName.has(name));
      if (missing.length > 0) {
        throw new Error(`module '${module.name}' missing required dependencies: ${missing.join(", ")}`);
      }

      this.modules.push(module);
      this.modulesByName.set(module.name, module);
    }

    return this;
  }

  resolve<TModule extends Module>(moduleName: string): TModule {
    const module = this.modulesByName.get(moduleName);
    if (!module) {
      throw new Error(`module dependency not found: ${moduleName}`);
    }

    return module as TModule;
  }

  async setupAll(): Promise<void> {
    for (const module of this.modules) {
      this.logger.info({module: module.name}, "module setup");
      await module.setup(this);
    }
  }

  async startAll(): Promise<void> {
    for (const module of this.modules) {
      await module.start();
    }
  }

  async stopAll(): Promise<void> {
    for (const module of [...this.modules].reverse()) {
      await module.stop();
    }
  }
}
