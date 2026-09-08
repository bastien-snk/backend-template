import { Application } from "@/app";
import { CompositeModeResolver } from "@/systems/runtime";

const modeResolver = new CompositeModeResolver();
const mode = modeResolver.resolve();

const app = new Application(mode);
await app.start();

let stopping = false;

const shutdown = async () => {
    if (stopping) return;

    stopping = true;
    await app.stop();
    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
