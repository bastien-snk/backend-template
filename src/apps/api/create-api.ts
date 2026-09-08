import {openapi} from "@elysiajs/openapi";
import {Elysia} from "elysia";

export function createApi(): Elysia {
  return new Elysia()
    .use(openapi())
    .get("/health", () => ({status: "ok"}));
}
