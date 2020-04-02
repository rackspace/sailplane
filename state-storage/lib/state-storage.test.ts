import {StateStorage} from "./state-storage";

export class FakeAwsSuccessResult {
    constructor(private value: any) {}

    promise() {
        return Promise.resolve(this.value);
    }
}

describe('StateStorage', () => {
    describe('#set', () => {
        let sut = new StateStorage('/prefix/');

        test('store something noisily', async () => {
            // GIVEN
            const mockPut = jest.fn(() => new FakeAwsSuccessResult(true));
            sut['ssm'].putParameter = mockPut as any;

            // WHEN
            await sut.set('service', 'name', {value: 'hello'});

            // THEN
            expect(mockPut.mock.calls.length).toBe(1);
            expect(mockPut.mock.calls[0][0].Name).toBe('/prefix/service/name');
            expect(mockPut.mock.calls[0][0].Value).toBe('{"value":"hello"}');
        });

        // Repeat with quiet flag in order to achieve code coverage
        test('store something quietly', async () => {
            // GIVEN
            const mockPut = jest.fn(() => new FakeAwsSuccessResult(true));
            sut['ssm'].putParameter = mockPut as any;

            // WHEN
            await sut.set('service', 'name', {value: 'hello'}, true);

            // THEN
            expect(mockPut.mock.calls.length).toBe(1);
            expect(mockPut.mock.calls[0][0].Name).toBe('/prefix/service/name');
            expect(mockPut.mock.calls[0][0].Value).toBe('{"value":"hello"}');
        })
    });

    describe('#get', () => {
        let sut = new StateStorage('/prefix');

        test('fetch something noisily', async () => {
            // GIVEN
            const mockGet = jest.fn(() => new FakeAwsSuccessResult({
                Parameter: {
                    Value: '{"value":"hello"}'
                }
            }));
            sut['ssm'].getParameter = mockGet as any;

            // WHEN
            const result = await sut.get('service', 'name');

            // THEN
            expect(mockGet.mock.calls.length).toBe(1);
            expect(mockGet.mock.calls[0][0].Name).toBe('/prefix/service/name');
            expect(result.value).toEqual('hello');
        });

        // Repeat with quiet flag in order to achieve code coverage
        test('fetch missing something quietly', async () => {
            // GIVEN
            const mockGet = jest.fn(() => new FakeAwsSuccessResult({}));
            sut['ssm'].getParameter = mockGet as any;

            // WHEN
            const result = await sut.get('service', 'name', true);

            // THEN
            expect(mockGet.mock.calls.length).toBe(1);
            expect(mockGet.mock.calls[0][0].Name).toBe('/prefix/service/name');
            expect(result).toBeUndefined();
        });
    });
});
