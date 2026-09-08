import {Application} from "@/app";
import {env} from "@/env";

const application = new Application(env);

await application.start(env.API_PORT);

const shutdown = async (): Promise<void> => {
  await application.stop();
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
