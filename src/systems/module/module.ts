import type {RuntimeContext} from "@/systems/runtime";

export abstract class Module {
  abstract readonly name: string;

  readonly requires: readonly string[] = [];

  constructor(protected readonly context: RuntimeContext) {}

  abstract setup(dependencies: ModuleDependencyResolver): Promise<void>;

  async start(): Promise<void> {}

  async stop(): Promise<void> {}
}

export interface ModuleDependencyResolver {
  resolve<TModule extends Module>(moduleName: string): TModule;
}
