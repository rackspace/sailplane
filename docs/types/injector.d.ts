/**
 * Dependency Injection (DI) injector.
 *
 * Using BottleJs because it is _extremely_ light weight and lazy-instantiate,
 * unlike any Typescript-specific solutions.
 *
 * @see https://github.com/young-steveo/bottlejs
 */
import * as Bottle from 'bottlejs';
declare type DependencyList = ({
    new (...args: any[]): any;
} | string)[];
/**
 * Wraps up type-safe version of BottleJs for common uses.
 *
 * The raw bottle is also available.
 */
export declare class Injector {
    static readonly bottle: Bottle<string>;
    /**
     * This may be called at beginning of process.
     * Not required at this point, but may help catch some mistakes.
     */
    static initialize(): void;
    /**
     * Register a class.
     *
     * Example service that lazy instantiates with no arguments:
     * - Injector.register(MyServiceClass);
     *
     * Example service that lazy instantiates with other registered items as arguments to
     * the constructor:
     * - Injector.register(MyServiceClass, [DependentClass, OtherClass, 'constant-name']);
     *
     * Example service that lazy instantiates with other registered items specified
     * as $inject:
     * - class MyServiceClass {
     * -   static readonly $inject = [OtherClass, 'constant-name'];
     * -   constructor(other, constValue) {};
     * - }
     * - Injector.register(MyServiceClass);

     * Example service that lazy instantiates with a factory function:
     * - Injector.register(MyServiceClass,
     * -                   () => new MyServiceClass(Injector.get(OtherClass)!, MyArg));
     *
     * @param clazz the class to register. Ex: MyClass. NOT an instance, the class.
     * @param factoryOrDependencies see above examples. Optional.
     * @return true if registered, false if not (duplicate or bad)
     */
    static register<T>(clazz: {
        new (...args: any[]): T;
        $inject?: DependencyList;
        name: string;
    }, factoryOrDependencies?: (() => T) | DependencyList): boolean;
    /**
     * Register a factory by name.
     *
     * Example:
     * - Injector.registerFactory('MyThing', () => Things.getOne());
     *
     * @see #getByName(name)
     * @param name name to give the inject.
     * @param factory function that returns a class.
     * @return true if registered, false if not (duplicate or bad)
     */
    static registerFactory<T>(name: string, factory: (() => T)): boolean;
    /**
     * Register a named constant value.
     *
     * @see #getByName(name)
     * @param name name to give this constant.
     * @param value value to return when the name is requested.
     */
    static registerConstant<T>(name: string, value: T): void;
    /**
     * Get instance of a class.
     * Will instantiate on first request.
     *
     * @param clazz the class to fetch. Ex: MyClass. NOT an instance, the class.
     * @return the singleton instance of the requested class, undefined if not registered.
     */
    static get<T>(clazz: {
        new (...args: any[]): T;
    }): T | undefined;
    /**
     * Get a registered constant or class by name.
     *
     * @see #registerFactory(name, factory, force)
     * @see #registerConstant(name, value, force)
     * @param name
     * @return the singleton instance registered under the given name,
     *         undefined if not registered.
     */
    static getByName<T>(name: string): T | undefined;
}
export {};
