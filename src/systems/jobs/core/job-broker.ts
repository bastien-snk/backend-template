export type JobMessage = {
    data: unknown;
};

export type JobBatchHandler = (jobs: JobMessage[]) => Promise<unknown>;

export type JobStartAfter = number | string | Date;

export type JobSendOptions = {
    retryLimit?: number;
    retryDelay?: number;
    retryBackoff?: boolean;
    startAfter?: JobStartAfter;
    expireInSeconds?: number;
    singletonKey?: string;
    deadLetter?: string;
};

export type JobWorkOptions = {
    batchSize?: number;
    pollingIntervalSeconds?: number;
};

export interface JobBroker {
    start(): Promise<void>;
    stop(): Promise<void>;
    createQueue(name: string): Promise<void>;
    send(
        name: string,
        data: object,
        options?: JobSendOptions,
    ): Promise<string | null>;
    work(
        name: string,
        options: JobWorkOptions,
        handler: JobBatchHandler,
    ): Promise<string>;
    schedule(
        name: string,
        cron: string,
        data?: object,
        options?: JobSendOptions,
    ): Promise<void>;
}
