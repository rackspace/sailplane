import {Injector} from "./injector";

describe("Injector", () => {

    test("Initialize", () => {
        // WHEN
        Injector.initialize();

        // THEN Nothing to check... doesn't explode.
    });

    describe("register() & get()", () => {

        test("register/get with no dependencies", () => {
            // GIVEN
            expect(NoDependencyClass.numInstances).toBe(0);

            // WHEN
            const registered = Injector.register(NoDependencyClass);
            const instance = Injector.get(NoDependencyClass)!;

            // THEN
            expect(registered).toBeTruthy();
            expect(instance).toBeInstanceOf(NoDependencyClass);
            expect(NoDependencyClass.numInstances).toBe(1);
        });

        test("register/get with array of dependencies", () => {
            // GIVEN
            expect(NoDependencyClass.numInstances).toBe(1);
            expect(OneDependencyClass.numInstances).toBe(0);

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

            Injector.register(FactoryBuiltClass,
                () => new FactoryBuiltClass("one", 2));

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

        test("register() duplicate", () => {
            // GIVEN
            expect(NoDependencyClass.numInstances).toBe(1);

            // WHEN
            const registered = Injector.register(NoDependencyClass);

            // THEN
            expect(registered).toBeFalsy();
            expect(NoDependencyClass.numInstances).toBe(1);
        });

        test("register(undefined)", () => {
            // WHEN
            const registered = Injector.register(undefined!);

            // THEN
            expect(registered).toBeFalsy();
        });

        test("register(not a class)", () => {
            // WHEN
            const registered = Injector.register((() => {}) as any);

            // THEN
            expect(registered).toBeFalsy();
        });

        test("register(bad dependencies)", () => {
            // WHEN
            const registered = Injector.register(Date, true as any);

            // THEN
            expect(registered).toBeFalsy();
        });
    });


    describe("registerFactory() & getByName()", () => {
        test("registerFactory/getByName with factory", () => {
            // GIVEN
            const name = 'factory-test';
            const someObject = { "api": 2, "url": "https://www.onica.com" };

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
            const name = 'factory-test';
            const someObject = { "api": 3 };


            // WHEN
            const registered = Injector.registerFactory(name, () => someObject);
            const instance = Injector.getByName<{api:number}>(name)!;

            // THEN
            expect(registered).toBeFalsy();
            expect(instance).toBeTruthy();
            expect(instance.api).toEqual(2); // previously registered value
        });

        test("registerFactory with blank name", () => {
            // WHEN
            const registered = Injector.registerFactory('', () => "nope");

            // THEN
            expect(registered).toBeFalsy();
            expect(Injector.getByName('')).toBeUndefined();
        });

        test("registerFactory with undefined name", () => {
            // WHEN
            const registered = Injector.registerFactory(undefined!, () => "nope");

            // THEN
            expect(registered).toBeFalsy();
            expect(Injector.getByName('')).toBeUndefined();
        });
    });

    describe("registerConstant() & getByName()", () => {
        test("registerConstant/getByName with object", () => {
            // GIVEN
            const name = 'const-test';
            const someObject = { "api": 2, "url": "https://www.onica.com" };

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
            const name = 'str-test';
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
            const name = 'const-test';
            const someObject = "hello";

            // WHEN
            const registered = Injector.registerConstant(name, someObject);
            const instance = Injector.getByName<{api:number}>(name)!;

            // THEN
            expect(registered).toBeFalsy();
            expect(instance).toBeTruthy();
            expect(instance.api).toEqual(2); // previously registered value
        });

        test("registerConstant with blank name", () => {
            // WHEN
            const registered = Injector.registerConstant('', "nope");

            // THEN
            expect(registered).toBeFalsy();
            expect(Injector.getByName('')).toBeUndefined();
        });

        test("registerConstant with undefined name", () => {
            // WHEN
            const registered = Injector.registerConstant(undefined!, "nope");

            // THEN
            expect(registered).toBeFalsy();
            expect(Injector.getByName('')).toBeUndefined();
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
    static $inject = [NoDependencyClass, 'OneDependencyClass'];
    constructor(public noDep: NoDependencyClass, public oneDep: OneDependencyClass) {
        TwoDependencyClass.numInstances++;
    }
}

class FactoryBuiltClass {
    static numInstances = 0;

    constructor(public value1: any, public value2: any) {
        FactoryBuiltClass.numInstances++;
    }
}
