/**
 * Dependency Injection (DI) injector.
 *
 * Using BottleJs because it is _extremely_ light weight and lazy-instantiate,
 * unlike any Typescript-specific solutions.
 *
 * @see https://github.com/young-steveo/bottlejs
 */
import * as Bottle from 'bottlejs';
import {Logger} from "@sailplane/logger";

const logger = new Logger('injector');

type DependencyList = ({new(...args): any}|string)[];

/** Convert list into array of dependency names */
function toNamedDependencies(list: DependencyList): string[] {
    if (list) {
        return list.map(dep => typeof dep === 'string' ? dep : dep.name);
    }
    else {
        return [];
    }
}

/**
 * Wraps up type-safe version of BottleJs for common uses.
 *
 * The raw bottle is also available.
 */
export class Injector {
    public static readonly bottle = Bottle.pop('global');

    /**
     * This may be called at beginning of process.
     * Not required at this point, but may help catch some mistakes.
     */
    static initialize() {
        // verifies that automatically injected dependencies are not undefined
        (Bottle.config as any).strict = true;
    }

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
    static register<T>(clazz: {new(...args): T, $inject?: DependencyList, name: string},
                       factoryOrDependencies?: (() => T)|DependencyList): boolean {

        if (!clazz || !clazz.name) {
            logger.error("Class to register is undefined", clazz);
            return false;
        }
        else if (Injector.bottle.container[clazz.name] == undefined) {
            if (!factoryOrDependencies) {
                const dependencies = toNamedDependencies(clazz.$inject as DependencyList);
                logger.debug(`Registering service ${clazz.name} with dependencies: ` + dependencies.toString() );
                Injector.bottle.service(clazz.name, clazz, ...dependencies);
                return true;
            }
            else if (Array.isArray(factoryOrDependencies)) {
                const dependencies = toNamedDependencies(factoryOrDependencies);
                logger.debug(`Registering service ${clazz.name} with dependencies: ` + dependencies.toString() );
                Injector.bottle.service(clazz.name, clazz, ...dependencies);
                return true;
            }
            else if (typeof factoryOrDependencies === 'function') {
                logger.debug(`Registering service ${clazz.name} with factory`);
                Injector.bottle.factory(clazz.name, factoryOrDependencies);
                return true;
            }
            else {
                logger.error(`Unknown type of factoryOrDependencies when registering ${clazz.name} with Injector`);
                return false;
            }
        }
        else {
            logger.debug(`Already registered service ${clazz.name}`);
            return false;
        }
    }

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
    static registerFactory<T>(name: string, factory: (() => T)): boolean {

        if (!name) {
            logger.error("Name to register is blank");
            return false;
        }
        else if (Injector.bottle.container[name] == undefined) {
            logger.debug(`Registering service ${name} with factory`);
            Injector.bottle.factory(name, factory);
            return true;
        }
        else {
            logger.debug(`Already registered factory ${name}`);
            return false;
        }
    }

    /**
     * Register a named constant value.
     *
     * @see #getByName(name)
     * @param name name to give this constant.
     * @param value value to return when the name is requested.
     */
    static registerConstant<T>(name: string, value: T): void {
        if (!name) {
            logger.error("Constant name to register is blank");
        }
        else if (Injector.bottle.container[name] == undefined) {
            Injector.bottle.constant(name, value);
        }
        else {
            logger.debug(`Already registered constant "${name}"`);
        }
    }

    /**
     * Get instance of a class.
     * Will instantiate on first request.
     *
     * @param clazz the class to fetch. Ex: MyClass. NOT an instance, the class.
     * @return the singleton instance of the requested class, undefined if not registered.
     */
    static get<T>(clazz: {new(...args): T;}): T|undefined {
        return Injector.bottle.container[clazz.name] as T;
    }

    /**
     * Get a registered constant or class by name.
     *
     * @see #registerFactory(name, factory, force)
     * @see #registerConstant(name, value, force)
     * @param name
     * @return the singleton instance registered under the given name,
     *         undefined if not registered.
     */
    static getByName<T>(name: string): T|undefined {
        return Injector.bottle.container[name] as T;
    }
}
