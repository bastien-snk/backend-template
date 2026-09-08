export type LockAcquisition = {
    acquired: boolean;
};

export interface Lock {
    tryAcquire(): Promise<LockAcquisition>;

    release(): Promise<void>;
}
