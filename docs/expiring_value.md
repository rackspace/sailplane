# ExpiringValue

Value that is instantiated on-demand and cached for a limited time.

## Overview

`ExpiringValue` is a container for a value that is instantiated on-demand (lazy-loaded via factory)
and cached for a limited time.
Once the cache expires, the factory is used again on next demand to get a fresh version.

In Lambda functions, it is useful to cache some data in instance memory to avoid
recomputing or fetching data on every invocation. In the early days of Lambda, instances only lasted 15 minutes
and thus set an upper-limit on how stale the cached data could be. With instances now seen to last for
many hours, a mechanism is needed to deal with refreshing stale content - thus `ExpiringValue` was born.

`ExpiringValue` is not limited to Lambdas, though. Use it anywhere you want to cache a value for
a limited time. It even works in the browser for client code.

A good use is with [StateStorage](state_storage.md),
to load configuration and cache it, but force the refresh of that configuration periodically.

## Install

```shell
npm install @sailplane/expiring-value
```

## API Documentation

[API Documentation on jsDocs.io](https://www.jsdocs.io/package/@sailplane/expiring-value)

## Example

Simplistic example of using `ExpiringValue` to build an HTTP cache:

```ts
const CACHE_PERIOD = 90_000; // 90 seconds
const https = new AwsHttps();
const cache = {};

export function fetchWithCache(url: string): Promise<any> {
    if (!cache[url]) {
        cache[url] = new ExpiringValue<any>(() => loadData(url), CACHE_PERIOD);
    }

    return cache[url].get();
}

function loadData(url: string): any {
    const req = https.buildRequest('GET', new URL(url));
    return https.request(req);
}
```

See [examples](examples.md) for another example.
