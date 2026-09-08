import { Locale } from "@/systems/localization/locale";
import { pgEnum } from "drizzle-orm/pg-core";

/** Shared database representation for all localized module content. */
export const locale = pgEnum(
    "locale",
    Object.values(Locale) as [Locale, ...Locale[]],
);
