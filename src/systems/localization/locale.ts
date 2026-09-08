/** Language tags supported by server-owned catalogue content. */
export enum Locale {
    EN = "en",
    FR = "fr",
}

export const DEFAULT_LOCALE = Locale.EN;
export const SUPPORTED_LOCALES: ReadonlySet<Locale> = new Set(
    Object.values(Locale),
);

export function resolveLocale(value: string | null | undefined): Locale {
    const language = value?.split(",")[0]?.trim().split("-")[0]?.toLowerCase();
    if (!language) return DEFAULT_LOCALE;

    const hasLocale = SUPPORTED_LOCALES.has(language as Locale);
    if (!hasLocale) return DEFAULT_LOCALE;

    return language as Locale;
}
