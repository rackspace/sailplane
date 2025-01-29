# @sailplane/state-storage - Serverless state and configuration storage

## What?

StateStorage is a simple wrapper for SSM `getParameter` and `putParameter` functions, abstracting it into
a contextual storage of small JSON objects.

This is part of the [sailplane](https://github.com/rackspace/sailplane) library of
utilities for AWS Serverless in Node.js.

## Why?

The AWS Parameter Store (SSM) was originally designed as a place to store configuration. It turns out that
it is also a pretty handy place for storing small bits of state information in between serverless executions.

Why use this instead of AWS SSM API directly?

- Simple Promise or async syntax
- Automatic object serialization/deserialization
- Logging
- Consistent naming convention

## How?

See the [docs](https://github.com/rackspace/sailplane/blob/master/README.md) for usage and examples.
