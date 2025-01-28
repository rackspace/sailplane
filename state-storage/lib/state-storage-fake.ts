import { StateStorage } from "./state-storage";

/**
 * Version of StateStorage to use in unit testing.
 * This fake will store data in instance memory, instead of the AWS Parameter Store.
 */
export class StateStorageFake extends StateStorage {
  storage: Record<string, string> = {};

  constructor(namePrefix: string) {
    super(namePrefix);
  }

  set(service: string, name: string, value: any, _options: any): Promise<void> {
    const key = this.generateName(service, name);
    this.storage[key] = JSON.stringify(value);
    return Promise.resolve();
  }

  get(service: string, name: string, _options: any): Promise<any> {
    const key = this.generateName(service, name);

    const content = this.storage[key];
    if (content) return Promise.resolve(JSON.parse(content));
    else return Promise.reject(new Error("mock StateStorage.get not found: " + key));
  }
}
