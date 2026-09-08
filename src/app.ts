import {createApi} from "@/apps/api/create-api";
import {createDatabase, type DatabaseConnection} from "@/systems/database";
import {createLogger, type Logger} from "@/systems/logging";
import {ModuleManager} from "@/systems/module";
import {AppMode, type RuntimeContext} from "@/systems/runtime";
import type {Env} from "@/env";

export class Application {
  private readonly database: DatabaseConnection;
  private readonly logger: Logger;
  private readonly modules: ModuleManager;
  private readonly context: RuntimeContext;

  constructor(env: Env) {
    this.logger = createLogger(env.LOG_LEVEL);
    this.database = createDatabase(env.DATABASE_URL);
    this.context = {mode: AppMode.API, http: createApi()};
    this.modules = new ModuleManager(this.logger);
  }

  async start(port: number): Promise<void> {
    await this.modules.setupAll();
    await this.modules.startAll();
    this.context.http.listen(port);
    this.logger.info({port}, "API listening");
  }

  async stop(): Promise<void> {
    await this.modules.stopAll();
    await this.database.close();
  }
}
