import {ExpiringValue} from "./expiring-value";
import * as MockDate from "mockdate";


describe('ExpiringValue',() => {
    const baseDate = Date.now();

    beforeEach(() => {
        MockDate.set(baseDate);
    });
    afterEach(() => {
        MockDate.reset();
    });

    // This is all one test, because the steps build upon each other.
    test('progressive test', async () => {
        let factoryValue = 'hello';

        // Initialize
        let sut = new ExpiringValue<string>(() => Promise.resolve(factoryValue), 1000);
        expect(sut['value']).toBeFalsy();
        expect(sut['expiration']).toEqual(0);

        // First GET - lazy created
        const v1 = await sut.get();
        expect(v1).toBe('hello');
        await expect(sut['value']).resolves.toBe('hello');
        expect(sut['expiration']).toEqual(baseDate + 1000);

        // Second GET - already have value
        factoryValue = 'error'; // if factory is called again, we won't get expected value
        const v2 = await sut.get();
        expect(v2).toBe('hello');
        await expect(sut['value']).resolves.toBe('hello');
        expect(sut['expiration']).toEqual(baseDate + 1000);

        // Passage of time...
        MockDate.set(baseDate + 1001);
        factoryValue = 'world';

        // Check that value is expired
        expect(sut.isExpired()).toBeTruthy();

        // Third GET - factory called again
        const v3 = await sut.get();
        expect(v3).toBe('world');
        await expect(sut['value']).resolves.toBe('world');
        expect(sut['expiration']).toEqual(baseDate + 1001 + 1000);

        // Check that value is not expired
        expect(sut.isExpired()).toBeFalsy();

        // Clear content..
        sut.clear();
        expect(sut['value']).toBeFalsy();
        expect(sut['expiration']).toEqual(0);

        // Fourth GET - factory called again
        MockDate.set(baseDate);
        factoryValue = 'world!';

        const v4 = await sut.get();
        expect(v4).toBe('world!');
        await expect(sut['value']).resolves.toBe('world!');
        expect(sut['expiration']).toEqual(baseDate + 1000);
    });
});
