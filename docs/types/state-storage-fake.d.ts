import { StateStorage } from "./state-storage";
/**
 * Version of StateStorage to use in unit testing.
 * This fake will store data in instance memory, instead of the AWS Parameter Store.
 */
export declare class StateStorageFake extends StateStorage {
    storage: {};
    constructor(namePrefix: string);
    set(service: string, name: string, value: any, options: any): Promise<void>;
    get(service: string, name: string, options: any): Promise<any>;
}
