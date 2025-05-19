# Injector

Light-weight and type-safe Dependency Injection.

## Overview

Simple, light-weight, lazy-instantiating, and type-safe dependency injection in TypeScript!
Perfect for use in Lambdas and unit test friendly.

It is built on top of [BottleJS](https://www.npmjs.com/package/bottlejs), with a simple type-safe
wrapper. The original `bottle` is available for more advanced use, though. Even if you are not using TypeScript,
you may still prefer this simplified interface over using BottleJS directly.

As of v3, Injector also supports a TypeScript decorator for registering classes.

`Injector` depends on one other utility to work:

- Sailplane [Logger](logger.md)

## Install

```shell
npm install @sailplane/injector @sailplane/logger bottlejs@2
```

## Configuration

If you wish to use the TypeScript decorator, these options must be enabled in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

If using [esbuild](https://esbuild.github.io), a plugin such as
[esbuild-decorators](https://github.com/anatine/esbuildnx/tree/main/packages/esbuild-decorators) is necessary.

## API Documentation

[API Documentation on jsDocs.io](https://www.jsdocs.io/package/@sailplane/injector)

## Usage with Examples

### Register a class with no dependencies and retrieve it

Use `Injector.register(className)` to register a class with the Injector. Upon the first call
to `Injector.get(className)`, the singleton instance will be created and returned.

Example without decorator:

```ts
import { Injector } from "@sailplane/injector";

export class MyService {}
Injector.register(MyService);

// Elsewhere...
const myService = Injector.get(MyService)!;
```

Example with decorator:

```ts
import { Injector, Injectable } from "@sailplane/injector";

@Injectable()
export class MyService {}

// Elsewhere...
const myService = Injector.get(MyService)!;
```

### Register a class with an array of dependencies

Use `Injector.register(className, dependencies: [])` to register a class with constructor
dependencies with the Injector. Upon the first call to `Injector.get(className)`, the
singleton instance will be created and returned.

`dependencies` is an array of either class names or strings with the names of things.

Example without decorator:

```ts
import { Injector } from "@sailplane/injector";

export class MyHelper {}
Injector.register(MyHelper);
Injector.registerConstant("stage", "dev");

export class MyService {
  constructor(
    private readonly helper: MyHelper,
    private readonly stage: string,
  ) {}
}
Injector.register(MyService, [MyHelper, "stage"]);
```

Example with decorator:

```ts
import { Injector, Injectable } from "@sailplane/injector";

@Injectable()
export class MyHelper {}
Injector.registerConstant("stage", "dev");

@Injectable({ dependencies: [MyHelper, "stage"] })
export class MyService {
  constructor(
    private readonly helper: MyHelper,
    private readonly stage: string,
  ) {}
}
```

### Register a class with static $inject array

Define your class with a `static $inject` member as an array of either class names or strings
with the names of registered dependencies, and a matching constructor that accepts the dependencies
in the same order. Then use `Injector.register(className)` to register a class.
Upon the first call to `Injector.get(className)`, the
singleton instance will be created with the specified dependencies.

This functions just like the previous use but allows you to specify the dependencies
right next to the constructor instead of after the class definition; thus making it easier to
keep the two lists synchronized.

Example:

```ts
import { Injector } from "@sailplane/injector";

export class MyHelper {}
Injector.register(MyHelper);
Injector.registerConstant("stage", "dev");

export class MyService {
  static readonly $inject = [MyHelper, "stage"];
  constructor(
    private readonly helper: MyHelper,
    private readonly stage: string,
  ) {}
}
Injector.register(MyService);
```

This approach is only applicable when not using the decorator.

### Register a class with a factory

If your class takes constructor parameters that are not in the dependency system, then
you can register a factory function.

Use `Injector.register<T>(className, factory: ()=>T)` to register a class with your
own factory function for instantiating the singleton instance.

Example without decorator:

```ts
import { Injector } from "@sailplane/injector";

export class MyHelper {}
Injector.register(MyHelper);

export class MyService {
  constructor(
    private readonly helper: MyHelper,
    private readonly stage: string,
  ) {}
}
Injector.register(MyService, () => new MyService(Injector.get(MyHelper)!, process.env.STAGE!));
```

Example with decorator:

```ts
import { Injector, Injectable } from "@sailplane/injector";

@Injectable()
export class MyHelper {}

@Injectable({ factory: () => new MyService(Injector.get(MyHelper)!, process.env.STAGE!) })
export class MyService {
  constructor(
    private readonly helper: MyHelper,
    private readonly stage: string,
  ) {}
}
```

### Register a child class that implements a parent

A common dependency injection pattern is to invent code dependencies by having business logic
define an interface it needs to talk to via an abstract class, and then elsewhere have a child
class define the actual behavior. Runtime options could even choose between implementations.

Here's the business logic code:

```ts
abstract class SpecialDataRepository {
  abstract get(id: string): Promise<SpecialData>;
}

class SpecialBizLogicService {
  constructor(dataRepo: SpecialDataRepository) {}
  public async calculate(id: string) {
    const data = await this.dataRepo.get(id);
    // do stuff
  }
}
Injector.register(SpecialBizLogicService); // Could use @Injectable() instead
```

Without decorators, we use `Injector.register<T>(className, factory: ()=>T)`
to register the implementing repository, which could be done conditionally:

Example without decorator:

```ts
import { Injector } from "@sailplane/injector";

export class LocalDataRepository extends SpecialDataRepository {
  async get(id: string): Promise<SpecialData> {
    // implementation ....
  }
}

export class RemoteDataRepository extends SpecialDataRepository {
  async get(id: string): Promise<SpecialData> {
    // implementation ....
  }
}

const isLocal = !!process.env.SHELL;
Injector.register(MyService, () =>
  isLocal ? new LocalDataRepository() : new RemoteDataRepository(),
);
```

Example with decorator (can't be conditional):

```ts
import { Injector, Injectable } from "@sailplane/injector";

@Injectable({ as: SpecialDataRepository })
export class RemoteDataRepository extends SpecialDataRepository {
  async get(id: string): Promise<SpecialData> {
    // implementation ....
  }
}
```

### Register anything with a factory and fetch it by name

If you need to inject something other than a class, you can register a factory to create
anything and give it a name. This is useful if you have multiple implementations
of an `interface`, and one to register one of them by the interface name at runtime. Since
interfaces don't exist at runtime (they don't exist in JavaScript), you must define the name
yourself. (See the previous example using an abstract base class for a more type-safe approach.)

Use `Injector.registerFactory<T>(name: string, factory: ()=>T)` to register any object with your
own factory function for returning the singleton instance.

Example: Inject a configuration

```ts
import { Injector } from "@sailplane/injector";

Injector.registerFactory("config", () => {
  // Note that this returns a Promise
  return Injector.get(StateStorage)!.get("MyService", "config");
});

// Elsewhere...
const config = await Injector.getByName("config");
```

Example: Inject an interface implementation, conditionally and no decorator

```ts
import { Injector } from "@sailplane/injector";

export interface FoobarService {
  doSomething(): void;
}

export class FoobarServiceImpl implements FoobarService {
  constructor(private readonly stateStorage: StateStorage) {}

  doSomething(): void {
    this.stateStorage.set("foobar", "did-it", "true");
  }
}

export class FoobarServiceDemo implements FoobarService {
  doSomething(): void {
    console.log("Nothing really");
  }
}

Injector.registerFactory("FoobarService", () => {
  if (process.env.DEMO! === "true") {
    return new FoobarServiceDemo();
  } else {
    return new FoobarServiceImpl(Injector.get(StateStorage)!);
  }
});

// Elsewhere...

export class MyService {
  static readonly $inject = ["FoobarService"]; // Note: This is a string!
  constructor(private readonly foobarSvc: FoobarService) {}
}
Injector.register(MyService);
```

Example: Inject an interface implementation with the decorator

```ts
import { Injector, Injectable } from "@sailplane/injector";

export interface FoobarService {
  doSomething(): void;
}

@Injectable({ as: "FoobarService" })
export class FoobarServiceImpl implements FoobarService {
  constructor(private readonly stateStorage: StateStorage) {}

  doSomething(): void {
    // code
  }
}

// Elsewhere...

@Injectable({ dependencies: ["FoobarService"] }) // Note: This is a string!
export class MyService {
  constructor(private readonly foobarSvc: FoobarService) {}
}
```

### Register a constant value and fetch it by name

Use `Injector.registerConstant<T>(name: string, value: T)` to register any object as a
defined value. Unlike all other registrations, the value is passed in rather than being
lazy-created.

Example:

```ts
import { Injector } from "@sailplane/injector";
import { environment } from "environment";

Injector.registerConstant("environment-config", environment);
Injector.registerConstant("promisedData", asyncFunction());

// Later...

const myEnv = Injector.getByName("environment-config");
const myData = await Injector.getByName("promisedData");
```

### Isolate class dependency injection for Unit test

Dependency that we need to mock out: `foo.repository.ts`:

```ts
import { Injector, Injectable } from "@sailplane/injector";

@Injectable()
export class FooRepository {
  get(id: string): Promise<Foo> {
    // implementation ....
  }
}
```

Service to unit test: `foo.service.ts`:

```ts
import { Injector, Injectable } from "@sailplane/injector";
import { FoobarRepository } from "./foo.repository.js";

@Injectable()
export class FooService {
  constructor(private readonly fooRepo: FooRepository) {}

  async getValue(id: string): Promise<string> {
    const foo = await this.fooRepo.get(id);
    return foo.value;
  }
}
```

The `import` of `FooRepository` will register it with `Injector`, but we'll just ignore that in our unit test:

```ts
import { FooService } from "./foo.service.js";

describe("FooService", () => {
  it("will return the value of a Foo", async () => {
    const mockRepo = { get: (id: string) => Promise.resolve("tada") };
    const uut = new FooService(mockRepo);
    expect(uut.getValue("test")).toEqual("tada");
  });
})
```

### Isolate dependency get for Unit test

Sometimes top-level code will need to call `Injector.get(name)` directly. To mock this out for a unit test,
we can switch injector domains. This is necessary when simply importing a dependency injects the real
dependency, because we cannot simply register a replacement.

Continuing with `FooService` from the previous example, here's `foo.handler.ts`:

```ts
import { FooService } from "./foo.service.js";

export const handler = (request) => {
  const fooService = Injector.get(FooService)!;
  return fooService.getValue(request.parameter.id);
}
```

To test this, we use `Injector.switchDomain(name)`:

```ts
import { Injector } from "@sailplane/injector";
import { handler } from "./foo.handler.js";

// Switch to test domain and register mock
Injector.switchDomain("test");
Injector.registerConstant("FooService", { getValue: (id) => id + " value" });

it("Foo handler returns requested value", async () => {
  expect(handler({parameter: { id: "hello" }})).toEqual("hello value");
});
```

## More Examples

See [examples](examples.md) for another example.

## Dependency Evaluation

Dependencies are not evaluated until the class is instantiated, thus the order of registration does not matter.

Cyclic constructor dependencies will fail. This probably indicates a design problem, but you can break the cycle by
calling `Injector.get(className)` when needed (outside the constructor), instead of injecting into the constructor.

This is a perfectly valid way of using Injector (on demand rather than upon construction). It does require
that unit test mocks be registered with the Injector rather than passed into the constructor.
