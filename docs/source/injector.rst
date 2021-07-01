Injector
========

Light-weight and type-safe Dependency Injection.

Overview
^^^^^^^^

Simple, light-weight, lazy-instantiating, and type-safe dependency injection in Typescript!
Perfect for use in Lambdas and unit test friendly.

It is built on top of `BottleJS <https://www.npmjs.com/package/bottlejs>`_, with a simple type-safe
wrapper. The original *bottle* is available for more advanced use, though. Even if you are not using Typescript,
you may still prefer this simplified interface over using BottleJS directly.

``Injector`` depends on one other utility to work:

- :doc:`logger`

Install
^^^^^^^

.. code-block:: shell

    npm install @sailplane/injector @sailplane/logger bottlejs@2

Usage with Examples
^^^^^^^^^^^^^^^^^^^

Register a class with no dependencies and retrieve it
-----------------------------------------------------

Use ``Injector.register(className)`` to register a class with the Injector. Upon the first call
to ``Injector.get(className)``, the singleton instance will be created and returned.

Example:

.. code-block:: ts

    import {Injector} from "@sailplane/injector";

    export class MyService {
    }
    Injector.register(MyService);

    // Later...
    const myService = Injector.get(MyService)!;

See the next section for another example of receiving a registered class as a dependency.

Register a class with an array of dependencies
----------------------------------------------

Use ``Injector.register(className, dependencies: [])`` to register a class with constructor
dependencies with the Injector. Upon the first call to ``Injector.get(className)``, the
singleton instance will be created and returned.

``dependencies`` is an array of either class names or strings with the names of things.

Example:

.. code-block:: ts

    import {Injector} from "@sailplane/injector";

    export class MyHelper {
    }
    Injector.register(MyHelper);
    Injector.registerConstant('stage', 'dev');

    export class MyService {
        constructor(private readonly helper: MyHelper,
                    private readonly stage: string) {
        }
    }
    Injector.register(MyService, [MyHelper, 'stage']);

Register a class with static $inject array
------------------------------------------

Define your class with a ``static $inject`` member as an array of either class names or strings
with the names of registered dependencies, and a matching constructor that accepts the dependencies
in the same order. Then use ``Injector.register(className)`` to register a class.
Upon the first call to ``Injector.get(className)``, the
singleton instance will be created with the specified dependencies.

This functions just like the previous use, but allows you to specify the dependencies
right next to the constructor instead of after the class definition; thus making it easier to
keep the two lists synchronized.

Example:

.. code-block:: ts

    import {Injector} from "@sailplane/injector";

    export class MyHelper {
    }
    Injector.register(MyHelper);
    Injector.registerConstant('stage', 'dev');

    export class MyService {
        static readonly $inject = [MyHelper, 'stage'];
        constructor(private readonly helper: MyHelper,
                    private readonly stage: string) {
        }
    }
    Injector.register(MyService);

Register a class with a factory
-------------------------------

If your class takes constructor parameters that are not in the dependency system, then
you can register a factory function.

Use ``Injector.register<T>(className, factory: ()=>T)`` to register a class with your
own factory function for instantiating the singleton instance.

Example:

.. code-block:: ts

    import {Injector} from "@sailplane/injector";

    export class MyHelper {
    }
    Injector.register(MyHelper);

    export class MyService {
        constructor(private readonly helper: MyHelper,
                    private readonly stage: string) {
        }
    }
    Injector.register(MyService,
                      () => new MyService(Injector.get(MyHelper)!, process.env.STAGE!));

Register anything with a factory and fetch it by name
-----------------------------------------------------

If you need to inject something other than a class, you can register a factory to create
anything and give it a name. This is particularly useful if you have multiple implementations
of an interface, and one to register one of them by the interface name at runtime. Since
interfaces don't exist at runtime (they don't exist in Javascript), you must define the name
yourself.

Use ``Injector.registerFactory<T>(name: string, factory: ()=>T)`` to register any object with your
own factory function for returning the singleton instance.

Example: Inject a configuration

.. code-block:: ts

    import {Injector} from "@sailplane/injector";

    Injector.registerFactory('config', () => {
        // Note that this returns a Promise
        return Injector.get(StateStorage)!.get('MyService', 'config');
    });

    // Later...

    const config = await Injector.getByName('config');

Example: Inject an interface implementation

.. code-block:: ts

    import {Injector} from "@sailplane/injector";

    export interface FoobarService {
        doSomething(): void;
    }

    export class FoobarServiceImpl implements FoobarService {
        constructor(private readonly stateStorage: StateStorage); {}

        doSomething(): void {
            this.stateStorage.set('foobar', 'did-it', 'true');
        }
    }

    export class FoobarServiceDemo implements FoobarService {
        doSomething(): void {
            console.log("Nothing really");
        }
    }

    Injector.registerFactory('FoobarService', () => {
        if (process.env.DEMO! === 'true') {
            return new FoobarServiceDemo();
        }
        else {
            return new FoobarServiceImpl(Injector.get(StateStorage)!);
        }
    });

    // Elsewhere...

    export class MyService {
        static readonly $inject = ['FoobarService']; // Note: This is a string!
        constructor(private readonly foobareSvc: FoobarService) {
        }
    }
    Injector.register(MyService);

Register a constant value and fetch it by name
----------------------------------------------

Use ``Injector.registerConstant<T>(name: string, value: T)`` to register any object as a
defined value. Unlike all other registrations, the value is passed in rather than being
lazy-created.

Example:

.. code-block:: ts

    import {Injector} from "@sailplane/injector";
    import {environment} from "environment";

    Injector.registerConstant('environment-config', environment);

    // Later...

    const myEnv = Injector.getByName('environment-config');


More Examples
-------------

See :doc:`examples` for another example.

Dependency Evaluation
---------------------

Dependencies are not evaluated until the class is instantiated, thus the order of registration does not matter.

Cyclic constructor dependencies will fail. This probably indicates a design problem, but you can break the cycle by
calling ``Injector.get(className)`` when needed (outside of the constructor), instead of injecting into the constructor.

This is a perfectly valid way of using Injector (on demand rather than upon construction). It does require
that unit test mocks be registered with the Injector rather than passed into the constructor.

Type Declarations
^^^^^^^^^^^^^^^^^

.. literalinclude:: ../../injector/dist/injector.d.ts
   :language: typescript
