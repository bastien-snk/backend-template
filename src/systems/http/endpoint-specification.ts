import type { DocumentDecoration, InputSchema } from "elysia";

export type EndpointSpecification = InputSchema<never> & {
    detail?: DocumentDecoration;
};
