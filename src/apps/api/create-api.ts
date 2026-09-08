import {openapi} from "@elysiajs/openapi";
import {Elysia} from "elysia";

export function createApi() {
  return new Elysia()
    .use(openapi())
    .get("/health", () => ({status: "ok"}));
}
