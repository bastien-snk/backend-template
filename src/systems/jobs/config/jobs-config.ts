import { z } from "zod";

export const JobsConfigSchema = z.object({
    pollingInterval: z.coerce
        .number()
        .int()
        .positive()
        .default(2)
        .describe("Global broker polling interval in seconds."),
    archiveCompletedAfter: z.coerce
        .number()
        .int()
        .positive()
        .default(43_200)
        .describe("Completed job archival threshold in seconds."),
    archiveFailedAfter: z.coerce
        .number()
        .int()
        .positive()
        .default(604_800)
        .describe("Failed job archival threshold in seconds."),
    expireIn: z.coerce
        .number()
        .int()
        .positive()
        .default(300)
        .describe("Default job expiration in seconds."),
});

export type JobsConfig = z.infer<typeof JobsConfigSchema>;
