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
            expect(mockPut).toHaveBeenCalledTimes(1);
            expect(mockPut).toHaveBeenCalledWith({
                Name: '/prefix/service/name',
                Value: '{"value":"hello"}',
                Type: 'String',
                Overwrite: true,
            });
        });

        test('store something quietly', async () => {
            // GIVEN
            const mockPut = jest.fn(() => new FakeAwsSuccessResult(true));
            sut['ssm'].putParameter = mockPut as any;

            // WHEN
            await sut.set('service', 'name', {value: 'hello'}, true);

            // THEN
            expect(mockPut).toHaveBeenCalledTimes(1);
            expect(mockPut).toHaveBeenCalledWith({
                Name: '/prefix/service/name',
                Value: '{"value":"hello"}',
                Type: 'String',
                Overwrite: true,
            });
        });

        test('store something as raw string', async () => {
            // GIVEN
            const mockPut = jest.fn(() => new FakeAwsSuccessResult(true));
            sut['ssm'].putParameter = mockPut as any;

            // WHEN
            await sut.set('service', 'name', "Goodbye", {quiet: true, isRaw: true});

            // THEN
            expect(mockPut).toHaveBeenCalledTimes(1);
            expect(mockPut).toHaveBeenCalledWith({
                Name: '/prefix/service/name',
                Value: 'Goodbye',
                Type: 'String',
                Overwrite: true,
            });
        });

        // Repeat with quiet flag in order to achieve code coverage
        test('store something securely', async () => {
            // GIVEN
            const mockPut = jest.fn(() => new FakeAwsSuccessResult(true));
            sut['ssm'].putParameter = mockPut as any;

            // WHEN
            await sut.set('service', 'name', {value: 'hello'}, {secure: true});

            // THEN
            expect(mockPut).toHaveBeenCalledTimes(1);
            expect(mockPut).toHaveBeenCalledWith({
                Name: '/prefix/service/name',
                Value: '{"value":"hello"}',
                Type: 'SecureString',
                Overwrite: true,
            });
        });
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
            expect(mockGet).toHaveBeenCalledTimes(1);
            expect(mockGet).toHaveBeenCalledWith({Name: '/prefix/service/name'});
            expect(result.value).toEqual('hello');
        });

        test('fetch missing something quietly', async () => {
            // GIVEN
            const mockGet = jest.fn(() => new FakeAwsSuccessResult({}));
            sut['ssm'].getParameter = mockGet as any;

            // WHEN
            const result = await sut.get('service', 'name', true);

            // THEN
            expect(mockGet).toHaveBeenCalledTimes(1);
            expect(mockGet).toHaveBeenCalledWith({Name: '/prefix/service/name'});
            expect(result).toBeUndefined();
        });

        test('fetch something as raw string', async () => {
            // GIVEN
            const mockGet = jest.fn(() => new FakeAwsSuccessResult({
                Parameter: {
                    Value: '{"value":"hello"}'
                }
            }));
            sut['ssm'].getParameter = mockGet as any;

            // WHEN
            const result = await sut.get('service', 'name', {isRaw: true});

            // THEN
            expect(mockGet).toHaveBeenCalledTimes(1);
            expect(mockGet).toHaveBeenCalledWith({Name: '/prefix/service/name'});
            expect(result).toEqual('{"value":"hello"}');
        });

        test('fetch something securely', async () => {
            // GIVEN
            const mockGet = jest.fn(() => new FakeAwsSuccessResult({
                Parameter: {
                    Value: '{"value":"hello"}'
                }
            }));
            sut['ssm'].getParameter = mockGet as any;

            // WHEN
            const result = await sut.get('service', 'name', {secure: true});

            // THEN
            expect(mockGet).toHaveBeenCalledTimes(1);
            expect(mockGet).toHaveBeenCalledWith({Name: '/prefix/service/name', WithDecryption: true});
            expect(result.value).toEqual('hello');
        });
    });
});
