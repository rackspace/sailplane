/**
 * Container for a value that is lazy-loaded whenever needed.
 * Further, it expires after a given time to avoid overly-stale data.
 */
export declare class ExpiringValue<T> {
    private factoryFn;
    private ttl;
    private options;
    /** Cached value */
    private value;
    /** Epoch millisecond time of when the current value expires */
    private expiration;
    /**
     * Construct a new expiring value.
     *
     * @param factoryFn factory to lazy-load the value
     * @param ttl milliseconds the value is good for, after which it is reloaded.
     * @param options optional options to change behavior
     * @param options.cacheError set to true to cache for TTL a Promise rejection from factoryFn.
     *        By default, a rejection is not cached and factoryFn will be retried upon the next call.
     */
    constructor(factoryFn: (() => Promise<T>), ttl: number, options?: {
        cacheError: boolean;
    });
    /**
     * Get value; lazy-load from factory if not yet loaded or if expired.
     */
    get(): Promise<T>;
    /**
     * Clear/expire the value now.
     * Following this with a get() will reload the data from the factory.
     */
    clear(): void;
    /**
     * Is the value expired (or not set)
     */
    isExpired(): boolean;
    /** Reset the value expiration to TTL past now */
    private extendExpiration;
}
