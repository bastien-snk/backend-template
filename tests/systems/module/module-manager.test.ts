import {describe, expect, test} from "bun:test";
import {Module, ModuleManager} from "@/systems/module";
import {AppMode, type RuntimeContext} from "@/systems/runtime";

const context = {mode: AppMode.API, http: {}} as RuntimeContext;
const logger = {info: () => undefined} as never;

describe("ModuleManager", () => {
  test("rejects a module whose dependency is not registered", () => {
    class DependentModule extends Module {
      readonly name = "dependent";
      override readonly requires = ["missing"];
      async setup(): Promise<void> {}
    }

    expect(() => new ModuleManager(logger).register(new DependentModule(context))).toThrow("missing required dependencies");
  });
});
