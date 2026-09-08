import { t } from "elysia";
import type { Static } from "elysia";

export const httpErrorIssueSchema = t.Object({
    field: t.String(),
    message: t.String(),
});

export const httpErrorDetailsSchema = t.Object({
    issues: t.Array(httpErrorIssueSchema),
});

export const httpErrorResponseSchema = t.Object({
    code: t.String(),
    message: t.String(),
    details: t.Optional(httpErrorDetailsSchema),
});

export type HttpErrorIssue = Static<typeof httpErrorIssueSchema>;
export type HttpErrorDetails = Static<typeof httpErrorDetailsSchema>;
export type HttpErrorResponse = Static<typeof httpErrorResponseSchema>;
