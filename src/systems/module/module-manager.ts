import type { Logger } from "@/systems/logger";
import { Module } from "@/systems/module/module";
import type { ModuleDependencyResolver } from "@/systems/module/module-dependency-resolver";

export class ModuleManager implements ModuleDependencyResolver {
    private readonly modules: Module[] = [];
    private readonly moduleIds = new Set<string>();
    private readonly modulesById = new Map<string, Module>();

    constructor(private readonly logger: Logger) {}

    register(...modules: Module[]): this {
        for (const module of modules) {
            if (this.moduleIds.has(module.name)) {
                throw new Error(
                    `module '${module.name}' is already registered`,
                );
            }

            const missingDependencies = module.requires.filter(
                (moduleId) => !this.moduleIds.has(moduleId),
            );
            if (missingDependencies.length > 0) {
                const missingNames = missingDependencies.join(", ");
                throw new Error(
                    `module '${module.name}' missing required dependencies: ${missingNames}`,
                );
            }

            this.moduleIds.add(module.name);
            this.modulesById.set(module.name, module);
            this.modules.push(module);
        }

        return this;
    }

    resolve<TModule extends Module>(moduleId: string): TModule {
        if (!this.modulesById.has(moduleId)) {
            throw new Error(`module dependency not found: ${moduleId}`);
        }

        return this.modulesById.get(moduleId) as TModule;
    }

    async setupAll(): Promise<void> {
        for (const module of this.modules) {
            try {
                this.logger.info("module setup", { module: module.name });
                await module.setup(this);

                this.logger.info("module ready", { module: module.name });
            } catch (error) {
                this.logger.warn("module setup failed", {
                    module: module.name,
                    error,
                });
                throw error;
            }
        }
    }

    async start(): Promise<void> {
        for (const module of this.modules) {
            await module.start();
        }
    }

    async stop(): Promise<void> {
        for (const module of [...this.modules].reverse()) {
            await module.stop();
        }
    }
}
