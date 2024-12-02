/**
 * Container for a value that is lazy-loaded whenever needed.
 * Further, it expires after a given time to avoid overly-stale data.
 */
export class ExpiringValue<T> {
    /** Cached value */
    private value: Promise<T> | undefined;

    /** Epoch millisecond time of when the current value expires */
    private expiration: number = 0;

    /**
     * Construct a new expiring value.
     *
     * @param factoryFn factory to lazy-load the value
     * @param ttl milliseconds the value is good for, after which it is reloaded.
     * @param options optional options to change behavior
     * @param options.cacheError set to true to cache for TTL a Promise rejection from factoryFn.
     *        By default, a rejection is not cached and factoryFn will be retried upon the next call.
     */
    constructor(
        private factoryFn: (() => Promise<T>),
        private ttl: number,
        private options = {cacheError: false}
    ) {
    }

    /**
     * Get value; lazy-load from factory if not yet loaded or if expired.
     */
    get(): Promise<T> {
        if (this.isExpired()) {
            this.value = this.factoryFn();

            if (this.options.cacheError) {
                this.extendExpiration();
            } else {
                // Update expiration, only upon success; no-op on error here
                this.value.then(() => this.extendExpiration()).catch(() => undefined);
            }
        }

        return this.value!;
    }

    /**
     * Clear/expire the value now.
     * Following this with a get() will reload the data from the factory.
     */
    clear(): void {
        this.value = undefined;
        this.expiration = 0;
    }

    /**
     * Is the value expired (or not set)
     */
    isExpired(): boolean {
        return Date.now() > this.expiration;
    }

    /** Reset the value expiration to TTL past now */
    private extendExpiration(): void {
        this.expiration = Date.now() + this.ttl;
    }
}
