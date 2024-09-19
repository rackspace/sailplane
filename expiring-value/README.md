# @sailplane/expiring-value - on-demand value with timeout

## What?

The `ExpringValue` generic class is a container for a value that is instantiated on-demand (lazy-loaded via factory) and cached for a limited
time. Once the cache expires, the factory is used again on next demand to get a fresh version.

This is part of the [sailplane](https://github.com/rackspace/sailplane) library of
utilities for AWS Serverless in Node.js.

## Why?

`ExpiringValue` is a container for a value that is instantiated on-demand (lazy-loaded via factory)
and cached for a limited time.
Once the cache expires, the factory is used again on next demand to get a fresh version.

In Lambda functions, it is useful to cache some data in instance memory to avoid
recomputing or fetching data on every invocation. In the early days of Lambda, instances only lasted 15 minutes
and thus set an upper-limit on how stale the cached data could be. With instances now seen to last for
many hours, a mechanism is needed to deal with refreshing stale content - thus `ExpiringValue` was born.

`ExpiringValue` is not limited to Lambdas, though. Use it anywhere you want to cache a value for
a limited time. It even works in the browser for client code.

## How?

See the [docs](https://github.com/rackspace/sailplane/blob/master/README.md) for usage and examples.
