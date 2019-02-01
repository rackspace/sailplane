import {Logger, LogLevels} from "./logger";

describe('Logger', () => {
    let originalConsoleLog;
    let mockLog: jest.Mock;

    beforeEach(() => {
        originalConsoleLog = global.console.log;
        global.console.log = mockLog = jest.fn();
    });

    afterEach(() => {
        global.console.log = originalConsoleLog;
        mockLog = undefined as any;
    });

    describe('configured for AWS CloudWatch environment', () => {
        beforeEach(() => {
            Logger.globalLogLevel = LogLevels.DEBUG;
            Logger.logTimestamps = false;
            Logger.formatObjects = false;
        });

        describe('debug level', () => {
            test('debug(message) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.debug('message');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0]).toEqual("DEBUG LoggerTest: message");
            });

            test('debug(message, params) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.debug('message', 1, true, 'third');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(4);
                expect(mockLog.mock.calls[0][0]).toEqual("DEBUG LoggerTest: message");
                expect(mockLog.mock.calls[0][1]).toEqual(1);
                expect(mockLog.mock.calls[0][2]).toEqual(true);
                expect(mockLog.mock.calls[0][3]).toEqual('third');
            });

            test('debugObject(message, object) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                const obj = {message: "I'm a teapot", statusCode: 418};

                // WHEN
                logger.debugObject('Formatted ', obj);

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0]).toEqual("DEBUG LoggerTest: Formatted {\"message\":\"I'm a teapot\",\"statusCode\":418}");
            });

            test('debug(message) to CloudWatch when log level is INFO', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                Logger.globalLogLevel = LogLevels.INFO;

                // WHEN
                logger.debug('message');

                // THEN
                expect(mockLog.mock.calls.length).toBe(0);
            });
        });

        describe('info level', () => {
            test('info(message) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.info('message');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0]).toEqual("INFO LoggerTest: message");
            });

            test('info(message, params) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.info('message', 1, true, 'third');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(4);
                expect(mockLog.mock.calls[0][0]).toEqual("INFO LoggerTest: message");
                expect(mockLog.mock.calls[0][1]).toEqual(1);
                expect(mockLog.mock.calls[0][2]).toEqual(true);
                expect(mockLog.mock.calls[0][3]).toEqual('third');
            });

            test('infoObject(message, object) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                const obj = {message: "I'm a teapot", statusCode: 418};

                // WHEN
                logger.infoObject('Formatted ', obj);

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0]).toEqual("INFO LoggerTest: Formatted {\"message\":\"I'm a teapot\",\"statusCode\":418}");
            });

            test('info(message) to CloudWatch when log level is WARN', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                Logger.globalLogLevel = LogLevels.WARN;

                // WHEN
                logger.info('message');

                // THEN
                expect(mockLog.mock.calls.length).toBe(0);
            });
        });

        describe('warn level', () => {
            test('warn(message) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.warn('message');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0]).toEqual("WARN LoggerTest: message");
            });

            test('warn(message, params) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.warn('message', 1, true, 'third');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(4);
                expect(mockLog.mock.calls[0][0]).toEqual("WARN LoggerTest: message");
                expect(mockLog.mock.calls[0][1]).toEqual(1);
                expect(mockLog.mock.calls[0][2]).toEqual(true);
                expect(mockLog.mock.calls[0][3]).toEqual('third');
            });

            test('warnObject(message, object) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                const obj = {message: "I'm a teapot", statusCode: 418};

                // WHEN
                logger.warnObject('Formatted ', obj);

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0]).toEqual("WARN LoggerTest: Formatted {\"message\":\"I'm a teapot\",\"statusCode\":418}");
            });

            test('warn(message) to CloudWatch when log level is ERROR', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                Logger.globalLogLevel = LogLevels.ERROR;

                // WHEN
                logger.warn('message');

                // THEN
                expect(mockLog.mock.calls.length).toBe(0);
            });
        });

        describe('error level', () => {
            test('error(message) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.error('message');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0]).toEqual("ERROR LoggerTest: message");
            });

            test('error(message, params) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.error('message', 1, true, 'third');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(4);
                expect(mockLog.mock.calls[0][0]).toEqual("ERROR LoggerTest: message");
                expect(mockLog.mock.calls[0][1]).toEqual(1);
                expect(mockLog.mock.calls[0][2]).toEqual(true);
                expect(mockLog.mock.calls[0][3]).toEqual('third');
            });

            test('errorObject(message, object) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                const obj = {message: "I'm a teapot", statusCode: 418};

                // WHEN
                logger.errorObject('Formatted ', obj);

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0]).toEqual("ERROR LoggerTest: Formatted {\"message\":\"I'm a teapot\",\"statusCode\":418}");
            });
        });
    });

    describe('configured for local console environment', () => {
        beforeEach(() => {
            Logger.globalLogLevel = LogLevels.DEBUG;
            Logger.logTimestamps = true;
            Logger.formatObjects = true;
        });

        describe('debug level', () => {
            test('debug(message) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.debug('message');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0]).toMatch(/^....-..-..T..:..:.. DEBUG LoggerTest: message$/);
            });

            test('debug(message, params) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.debug('message', 1, true, 'third');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(4);
                expect(mockLog.mock.calls[0][0]).toMatch(/^....-..-..T..:..:.. DEBUG LoggerTest: message$/);
                expect(mockLog.mock.calls[0][1]).toEqual(1);
                expect(mockLog.mock.calls[0][2]).toEqual(true);
                expect(mockLog.mock.calls[0][3]).toEqual('third');
            });

            test('debugObject(message, object) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                const obj = {message: "I'm a teapot", statusCode: 418};

                // WHEN
                logger.debugObject('Formatted ', obj);

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0].substr(0, 20)).toMatch(/^....-..-..T..:..:.. $/);
                expect(mockLog.mock.calls[0][0].substr(20)).toEqual("DEBUG LoggerTest: Formatted {\n  \"message\": \"I'm a teapot\",\n  \"statusCode\": 418\n}");
            });

            test('debug(message) to console when log level is INFO', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                Logger.globalLogLevel = LogLevels.INFO;

                // WHEN
                logger.debug('message');

                // THEN
                expect(mockLog.mock.calls.length).toBe(0);
            });
        });

        describe('info level', () => {
            test('info(message) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.info('message');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0]).toMatch(/^....-..-..T..:..:.. INFO LoggerTest: message$/);
            });

            test('info(message, params) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.info('message', 1, true, 'third');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(4);
                expect(mockLog.mock.calls[0][0]).toMatch(/^....-..-..T..:..:.. INFO LoggerTest: message$/);
                expect(mockLog.mock.calls[0][1]).toEqual(1);
                expect(mockLog.mock.calls[0][2]).toEqual(true);
                expect(mockLog.mock.calls[0][3]).toEqual('third');
            });

            test('infoObject(message, object) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                const obj = {message: "I'm a teapot", statusCode: 418};

                // WHEN
                logger.infoObject('Formatted ', obj);

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0].substr(0, 20)).toMatch(/^....-..-..T..:..:.. $/);
                expect(mockLog.mock.calls[0][0].substr(20)).toEqual("INFO LoggerTest: Formatted {\n  \"message\": \"I'm a teapot\",\n  \"statusCode\": 418\n}");
            });

            test('info(message) to console when log level is WARN', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                Logger.globalLogLevel = LogLevels.WARN;

                // WHEN
                logger.info('message');

                // THEN
                expect(mockLog.mock.calls.length).toBe(0);
            });
        });

        describe('warn level', () => {
            test('warn(message) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.warn('message');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0]).toMatch(/^....-..-..T..:..:.. WARN LoggerTest: message$/);
            });

            test('warn(message, params) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.warn('message', 1, true, 'third');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(4);
                expect(mockLog.mock.calls[0][0]).toMatch(/^....-..-..T..:..:.. WARN LoggerTest: message$/);
                expect(mockLog.mock.calls[0][1]).toEqual(1);
                expect(mockLog.mock.calls[0][2]).toEqual(true);
                expect(mockLog.mock.calls[0][3]).toEqual('third');
            });

            test('warnObject(message, object) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                const obj = {message: "I'm a teapot", statusCode: 418};

                // WHEN
                logger.warnObject('Formatted ', obj);

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0].substr(0, 20)).toMatch(/^....-..-..T..:..:.. $/);
                expect(mockLog.mock.calls[0][0].substr(20)).toEqual("WARN LoggerTest: Formatted {\n  \"message\": \"I'm a teapot\",\n  \"statusCode\": 418\n}");
            });

            test('warn(message) to console when log level is ERROR', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                Logger.globalLogLevel = LogLevels.ERROR;

                // WHEN
                logger.warn('message');

                // THEN
                expect(mockLog.mock.calls.length).toBe(0);
            });
        });

        describe('error level', () => {
            test('error(message) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.error('message');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0]).toMatch(/^....-..-..T..:..:.. ERROR LoggerTest: message$/);
            });

            test('error(message, params) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.error('message', 1, true, 'third');

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(4);
                expect(mockLog.mock.calls[0][0]).toMatch(/^....-..-..T..:..:.. ERROR LoggerTest: message$/);
                expect(mockLog.mock.calls[0][1]).toEqual(1);
                expect(mockLog.mock.calls[0][2]).toEqual(true);
                expect(mockLog.mock.calls[0][3]).toEqual('third');
            });

            test('errorObject(message, object) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                const obj = {message: "I'm a teapot", statusCode: 418};

                // WHEN
                logger.errorObject('Formatted ', obj);

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(1);
                expect(mockLog.mock.calls[0][0].substr(0, 20)).toMatch(/^....-..-..T..:..:.. $/);
                expect(mockLog.mock.calls[0][0].substr(20)).toEqual("ERROR LoggerTest: Formatted {\n  \"message\": \"I'm a teapot\",\n  \"statusCode\": 418\n}");
            });

            test('error(exception) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                const error = new Error("I broke");

                // WHEN
                logger.error(error);

                // THEN
                expect(mockLog.mock.calls.length).toBe(1);
                expect(mockLog.mock.calls[0].length).toBe(2);
                expect(mockLog.mock.calls[0][0]).toMatch(/^....-..-..T..:..:.. ERROR LoggerTest: $/);
                expect(mockLog.mock.calls[0][1]).toEqual(error);
            })
        });
    });
});
