export type ModuleApiError<Code extends string = string> = {
    code: Code;
    message: string;
    details?: unknown;
};
