# StateStorage

Serverless state and configuration storage.

## Overview

The [AWS Parameter Store (SSM)](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
was originally designed as a place to store configuration. It turns out that
it is also a pretty handy place for storing small bits of state information in between serverless executions.

`StateStorage` is a simple wrapper for SSM `getParameter` and `putParameter` functions, abstracting it into
a contextual storage of small JSON objects.

Why use this instead of AWS SSM API directly?

- Simple Promise or async syntax
- Automatic object serialization/deserialization
- Logging
- Consistent naming convention

`StateStorage` depends on one other utility to work:

- Sailplane [Logger](logger.md)

## Install

```shell
npm install @sailplane/state-storage @sailplane/logger @aws-sdk/client-ssm
```

## API Documentation

[API Documentation on jsDocs.io](https://www.jsdocs.io/package/@sailplane/state-storage)

## Examples

Your Lambda will need permission to access the Parameter Store. Here's an example in `serverless.yml`:

```yaml
provider:
  name: aws

  environment:
    STATE_STORAGE_PREFIX: /${opt:stage}/myapp

  iamRoleStatements:
    - Effect: Allow
      Action:
        - ssm:GetParameter
        - ssm:PutParameter
      Resource: "arn:aws:ssm:${opt:region}:*:parameter${self:provider.environment.STATE_STORAGE_PREFIX}/*"

    - Effect: Allow
      Action:
        - kms:Decrypt
        - kms:Encrypt
      Resource: "arn:aws:kms:${opt:region}:*:alias/aws/ssm"
      Condition:
        StringEquals:
          "kms:EncryptionContext:PARAMETER_ARN": "arn:aws:ssm:${opt:region}:*:parameter${self:provider.environment.STATE_STORAGE_PREFIX}/*"
```

Note that this is the complete set of possible permissions.
Not all are needed if only reading parameters or if not using the `secure` option.

**Simple example storing state**

```ts
import { StateStorage } from "@sailplane/state-storage";

const stateStore = new StateStorage(process.env.STATE_STORAGE_PREFIX!);

export async function myHandler(event, context): Promise<any> {
  let state = await stateStore.get("thing", "state");
  const result = await processRequest(state, event);
  await stateStore.set("thing", "state", state);
  return result;
}
```

See [examples](examples.md) for another example.

## Unit testing your services

Use `StateStorageFake` to unit test your services that use `StateStorage`. The fake will
store data in instance memory, instead of the AWS Parameter Store.
