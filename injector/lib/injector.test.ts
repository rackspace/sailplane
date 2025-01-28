import { Injectable, Injector } from "./injector";

/**
 * Helper for calls that are expected to throw.
 * Not using jest.expect#toThrow because it insists on logging errors and stack traces.
 * @param fn function to call
 * @returns the thrown error
 * @throws error if fn doesn't throw
 */
function expectThrow(fn: () => any): unknown {
  try {
    fn();
  } catch (err) {
    return err;
  }
  throw new Error("expected to have thrown");
}

describe("Injector", () => {
  describe("register() & get()", () => {
    test("register/get with no dependencies", () => {
      // GIVEN
      expect(NoDependencyClass.numInstances).toBe(0);
      expect(Injector.isRegistered(NoDependencyClass)).toBeFalsy();

      // WHEN
      Injector.register(NoDependencyClass);
      const instance = Injector.get(NoDependencyClass)!;

      // THEN
      expect(instance).toBeInstanceOf(NoDependencyClass);
      expect(NoDependencyClass.numInstances).toBe(1);
    });

    test("register/get with array of dependencies", () => {
      // GIVEN
      expect(NoDependencyClass.numInstances).toBe(1);
      expect(OneDependencyClass.numInstances).toBe(0);
      expect(Injector.isRegistered(OneDependencyClass)).toBeFalsy();

      Injector.register(OneDependencyClass, [NoDependencyClass]);

      // WHEN
      const instance = Injector.get(OneDependencyClass)!;

      // THEN
      expect(instance).toBeInstanceOf(OneDependencyClass);
      expect(instance.noDep).toBeInstanceOf(NoDependencyClass);
      expect(NoDependencyClass.numInstances).toBe(1); // reused!
      expect(OneDependencyClass.numInstances).toBe(1);
    });

    test("register/get with static $inject of dependencies", () => {
      // GIVEN
      expect(NoDependencyClass.numInstances).toBe(1);
      expect(OneDependencyClass.numInstances).toBe(1);
      expect(TwoDependencyClass.numInstances).toBe(0);
      expect(Injector.isRegistered(TwoDependencyClass)).toBeFalsy();

      Injector.register(TwoDependencyClass);

      // WHEN
      const instance = Injector.get(TwoDependencyClass)!;

      // THEN
      expect(instance).toBeInstanceOf(TwoDependencyClass);
      expect(instance.noDep).toBeInstanceOf(NoDependencyClass);
      expect(instance.oneDep).toBeInstanceOf(OneDependencyClass);
      expect(NoDependencyClass.numInstances).toBe(1); // reused!
      expect(OneDependencyClass.numInstances).toBe(1); // reused!
      expect(TwoDependencyClass.numInstances).toBe(1);
    });

    test("register/get with factory", () => {
      // GIVEN
      expect(FactoryBuiltClass.numInstances).toBe(0);

      Injector.register(FactoryBuiltClass, () => new FactoryBuiltClass("one", 2));

      // WHEN
      const instanceA = Injector.get(FactoryBuiltClass)!;
      const instanceB = Injector.get(FactoryBuiltClass)!;

      // THEN
      expect(instanceA).toBeInstanceOf(FactoryBuiltClass);
      expect(instanceA.value1).toEqual("one");
      expect(instanceA.value2).toEqual(2);
      expect(FactoryBuiltClass.numInstances).toBe(1);
      expect(instanceA).toBe(instanceB);
    });

    test("register() duplicate ignored", () => {
      // GIVEN
      expect(NoDependencyClass.numInstances).toBe(1);

      // WHEN
      Injector.register(NoDependencyClass);

      // THEN
      expect(NoDependencyClass.numInstances).toBe(1);
    });

    test("register(undefined)", () => {
      // WHEN
      const err = expectThrow(() => Injector.register(undefined!));

      // THEN
      expect(err).toBeInstanceOf(TypeError);
    });

    test("register(not a class)", () => {
      // WHEN
      const err = expectThrow(() => Injector.register((() => {}) as any));

      // THEN
      expect(err).toBeInstanceOf(TypeError);
    });

    test("register(bad dependencies)", () => {
      // WHEN
      const err = expectThrow(() => Injector.register(Date, true as any));

      // THEN
      expect(err).toBeInstanceOf(TypeError);
    });
  });

  describe("Injectable decorator", () => {
    test("register with automatic dependency detection", () => {
      // GIVEN
      expect(Injector.isRegistered(NoDependencyClass)).toBeTruthy();
      expect(Injector.isRegistered(OneDependencyClass)).toBeTruthy();
      expect(Injector.isRegistered("DecoratedClass")).toBeFalsy();

      // WHEN
      @Injectable()
      class DecoratedClass {
        static numInstances = 0;

        constructor(
          public noDep: NoDependencyClass,
          public oneDep: OneDependencyClass,
        ) {
          DecoratedClass.numInstances++;
        }
        get instanceCount() {
          return DecoratedClass.numInstances;
        }
      }

      // THEN decorated class has registered but not yet instantiated
      expect(DecoratedClass.numInstances).toBe(0);
      expect(Injector.isRegistered(DecoratedClass)).toBeTruthy();
      expect(Injector.isRegistered("DecoratedClass")).toBeTruthy();

      // WHEN
      const instance = Injector.getByName("DecoratedClass")! as any;

      // THEN we can examine the instance, even though don't have access to class def anymore
      expect(instance).toBeDefined();
      expect(instance.constructor.name).toEqual("DecoratedClass");
      expect(instance.instanceCount).toBe(1);
    });

    test("register as parent and no constructor", () => {
      // GIVEN
      abstract class HexagonalPort2 {
        abstract getThing(): string;
      }
      expect(Injector.isRegistered(HexagonalPort2)).toBeFalsy();

      @Injectable({ as: HexagonalPort2 })
      class HexagonalAdaptor2 extends HexagonalPort2 {
        getThing() {
          return "thing";
        }
      }
      expect(Injector.isRegistered(HexagonalPort2)).toBeTruthy();

      // WHEN
      const instance = Injector.get(HexagonalPort2)!;

      // THEN
      expect(instance).toBeInstanceOf(HexagonalAdaptor2);
      expect(instance.getThing()).toEqual("thing");
    });

    test("register as name", () => {
      // GIVEN
      interface HexagonalPort3 {
        getThing(): string;
      }
      expect(Injector.isRegistered("HexagonalPort3")).toBeFalsy();

      @Injectable({ as: "HexagonalPort3" })
      class HexagonalAdaptor3 implements HexagonalPort3 {
        constructor() {}
        getThing() {
          return "thing";
        }
      }
      expect(Injector.isRegistered("HexagonalPort3")).toBeTruthy();

      // WHEN
      const instance = Injector.getByName<HexagonalPort3>("HexagonalPort3")!;

      // THEN
      expect(instance).toBeInstanceOf(HexagonalAdaptor3);
      expect(instance.getThing()).toEqual("thing");
    });

    test("register with factory as parent", () => {
      // GIVEN
      abstract class HexagonalPort {
        abstract getThing(): string;
      }
      expect(Injector.isRegistered(HexagonalPort)).toBeFalsy();

      @Injectable({ factory: () => new HexagonalAdaptor(), as: HexagonalPort })
      class HexagonalAdaptor extends HexagonalPort {
        constructor() {
          super();
        }
        getThing() {
          return "thing";
        }
      }
      expect(Injector.isRegistered(HexagonalPort)).toBeTruthy();

      // WHEN
      const instance = Injector.get(HexagonalPort)!;

      // THEN
      expect(instance).toBeInstanceOf(HexagonalAdaptor);
      expect(instance.getThing()).toEqual("thing");
    });

    test("register as NOT parent fails", () => {
      // WHEN
      try {
        @Injectable({ as: String })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- eslint fails to understand @Injectable
        class NotChildOfString extends NoDependencyClass {}

        fail("Expected to throw");
      } catch (_) {
        // Expected
      }
    });

    test("fail to register both factory and dependencies", () => {
      // WHEN
      try {
        @Injectable({ factory: () => new NoCanDo(), dependencies: [] })
        class NoCanDo {}

        fail("Expected to throw");
      } catch (_) {
        // Expected
      }
    });
  });

  describe("registerFactory() & getByName()", () => {
    test("registerFactory/getByName with factory", () => {
      // GIVEN
      const name = "factory-test";
      const someObject = { api: 2, url: "https://www.onica.com" };

      Injector.registerFactory(name, () => someObject);

      // WHEN
      const instanceA = Injector.getByName(name)!;
      const instanceB = Injector.getByName(name)!;

      // THEN
      expect(instanceA).toBe(someObject);
      expect(instanceA).toBe(instanceB);
    });

    test("registerFactory with duplicate name", () => {
      // GIVEN
      const name = "factory-test";
      const someObject = { api: 3 };

      // WHEN
      Injector.registerFactory(name, () => someObject);
      const instance = Injector.getByName<{ api: number }>(name)!;

      // THEN
      expect(instance).toBeTruthy();
      expect(instance.api).toEqual(2); // previously registered value
    });

    test("registerFactory with blank name", () => {
      // WHEN
      const err = expectThrow(() => Injector.registerFactory("", () => "nope"));

      // THEN
      expect(err).toBeInstanceOf(TypeError);
      expect(Injector.isRegistered("")).toBeFalsy();
    });

    test("registerFactory with undefined name", () => {
      // WHEN
      const err = expectThrow(() => Injector.registerFactory(undefined!, () => "nope"));

      // THEN
      expect(err).toBeInstanceOf(TypeError);
      expect(Injector.getByName(undefined!)).toBeUndefined();
    });
  });

  describe("registerConstant() & getByName()", () => {
    test("registerConstant/getByName with object", () => {
      // GIVEN
      const name = "const-test";
      const someObject = { api: 2, url: "https://www.onica.com" };

      Injector.registerConstant(name, someObject);

      // WHEN
      const instanceA = Injector.getByName(name)!;
      const instanceB = Injector.getByName(name)!;

      // THEN
      expect(instanceA).toBe(someObject);
      expect(instanceA).toBe(instanceB);
    });

    test("registerConstant/getByName with string", () => {
      // GIVEN
      const name = "str-test";
      const someValue = "Hello World!";

      Injector.registerConstant(name, someValue);

      // WHEN
      const instanceA = Injector.getByName(name)!;
      const instanceB = Injector.getByName(name)!;

      // THEN
      expect(instanceA).toBe(someValue);
      expect(instanceA).toBe(instanceB);
    });

    test("registerConstant with duplicate name", () => {
      // GIVEN
      const name = "const-test";
      const someObject = "hello";

      // WHEN
      Injector.registerConstant(name, someObject);
      const instance = Injector.getByName<{ api: number }>(name)!;

      // THEN
      expect(instance).toBeTruthy();
      expect(instance.api).toEqual(2); // previously registered value
    });

    test("registerConstant with blank name", () => {
      // WHEN
      const err = expectThrow(() => Injector.registerConstant("", "nope"));

      // THEN
      expect(err).toBeInstanceOf(TypeError);
      expect(Injector.isRegistered("")).toBeFalsy();
    });

    test("registerConstant with null name", () => {
      // WHEN
      const err = expectThrow(() => Injector.registerConstant(null!, "nope"));

      // THEN
      expect(err).toBeInstanceOf(TypeError);
      expect(Injector.getByName(null!)).toBeUndefined();
    });
  });
});

class NoDependencyClass {
  static numInstances = 0;

  constructor() {
    NoDependencyClass.numInstances++;
  }
}

class OneDependencyClass {
  static numInstances = 0;

  constructor(public noDep: NoDependencyClass) {
    OneDependencyClass.numInstances++;
  }
}

class TwoDependencyClass {
  static numInstances = 0;

  // Can specify dependency by class or name.
  static $inject = [NoDependencyClass, "OneDependencyClass"];
  constructor(
    public noDep: NoDependencyClass,
    public oneDep: OneDependencyClass,
  ) {
    TwoDependencyClass.numInstances++;
  }
}

class FactoryBuiltClass {
  static numInstances = 0;

  constructor(
    public value1: any,
    public value2: any,
  ) {
    FactoryBuiltClass.numInstances++;
  }
}
