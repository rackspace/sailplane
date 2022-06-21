import { LogFormat, LogLevel } from './common';
import type { Context } from "aws-lambda";

const mockEnv = {
    ...process.env,
    AWS_REGION: "us-test-1",
    AWS_LAMBDA_FUNCTION_NAME: "unitTest",
    AWS_LAMBDA_FUNCTION_VERSION: "2",
    AWS_LAMBDA_FUNCTION_MEMORY_SIZE: "128",
    ENVIRONMENT: undefined,
    STAGE: undefined,
    SERVERLESS_STAGE: "test",
    _X_AMZN_TRACE_ID: undefined,
    LOG_LEVEL: undefined,
    LOG_TO_CLOUDWATCH: undefined,
    LOG_TIMESTAMPS: undefined,
    LOG_FORMAT: undefined,
};

const mockContext: Partial<Context> = {
    functionName: "unitTest",
    functionVersion: "2",
    memoryLimitInMB: "128",
    awsRequestId: "aws-request-123",
};

const timestampRegEx = /^20\d\d-\d\d-\d\dT\d\d:\d\d:.*/;

describe('Logger', () => {
    let Logger;
    let mockDebug: jest.Mock;
    let mockInfo: jest.Mock;
    let mockWarn: jest.Mock;
    let mockError: jest.Mock;

    beforeEach(async () => {
        // Object.assign(process.env, mockEnv);
        Object.entries(mockEnv).forEach(([key, value]) => {
            if (value === undefined) {
                delete process.env[key];
            }
            else {
                process.env[key] = value;
            }
        });
        global.console.debug = mockDebug = jest.fn();
        global.console.info = mockInfo = jest.fn();
        global.console.warn = mockWarn = jest.fn();
        global.console.error = mockError = jest.fn();
        jest.resetModules();
    });

    describe('Environment variable', () => {
        test('set to "NONE" with environment variable', () => {
            // GIVEN
            process.env.LOG_LEVEL = 'NONE';

            // WHEN
            Logger = require('./logger').Logger;

            // THEN
            expect(new Logger("").level).toBe(1);
        });
    });

    test("when set and read log level", () => {
        // GIVEN
        Logger = require('./logger').Logger;
        Logger.initialize({
            level: LogLevel.DEBUG,
        });
        const logger = new Logger("LoggerTest");
        expect(logger.level).toEqual(LogLevel.DEBUG);
        // WHEN
        logger.level = LogLevel.NONE;
        // THEN
        expect(logger.level).toEqual(LogLevel.NONE);
    });

    describe('configured for AWS CloudWatch environment', () => {
        beforeEach(() => {
            process.env.LOG_TO_CLOUDWATCH = 'true';
            process.env.LOG_TIMESTAMPS = "true";
            process.env.LOG_FORMAT = "PRETTY"; // overrides in tests, but provides test coverage
            process.env.AWS_XRAY_CONTEXT_MISSING = "LOG_ERROR";
            process.env._X_AMZN_TRACE_ID = "xray-123";
            Logger = require('./logger').Logger;
        });

        describe('debug level with flat output', () => {
            beforeEach(() => {
                Logger.initialize({
                    level: LogLevel.DEBUG,
                    outputLevels: false,
                    logTimestamps: false,
                    format: LogFormat.FLAT,
                });
            });

            test('debug(message) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.debug('message');

                // THEN
                expect(mockDebug).toHaveBeenCalledTimes(1);
                expect(mockDebug).toHaveBeenCalledWith("LoggerTest:", "message");
            });

            test('debug(message, params) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.debug('message', 1, true, 'third');

                // THEN
                expect(mockDebug).toHaveBeenCalledWith(
                    "LoggerTest:", "message", 1, true, "third"
                );
            });

            test('debug(message) to CloudWatch when log level is WARN', () => {
                // GIVEN
                const logger = new Logger({
                    module: "LoggerTest",
                    level: LogLevel.WARN,
                });

                // WHEN
                logger.debug('message');

                // THEN
                expect(mockDebug).not.toHaveBeenCalled();
            });

            test('debugObject(message, object) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                const obj = {message: "I'm a teapot", statusCode: 418};

                // WHEN
                logger.debugObject('Formatted ', obj);

                // THEN
                expect(mockDebug).toHaveBeenCalledWith(
                    "LoggerTest:",
                    "Formatted ", "{\"message\":\"I'm a teapot\",\"statusCode\":418}"
                );
            });

            test('debugObject(message) to CloudWatch when log level is INFO', () => {
                // GIVEN
                const logger = new Logger({
                    module: "LoggerTest",
                    level: LogLevel.INFO,
                });

                // WHEN
                logger.debugObject('message', {});

                // THEN
                expect(mockDebug).not.toHaveBeenCalled();
            });
        });

        describe('info level with structured output', () => {

            beforeEach(() => {
                Logger.initialize({
                    level: LogLevel.DEBUG,
                    outputLevels: false,
                    logTimestamps: false,
                    format: LogFormat.STRUCT,
                });
                Logger.setLambdaContext(mockContext);
            });

            test('info(message) to CloudWatch', () => {
                // GIVEN
                Logger.addAttributes({correlation_id: "876"});
                const logger = new Logger({ module: "LoggerTest" });

                // WHEN
                logger.info('text');

                // THEN
                expect(mockInfo).toHaveBeenCalledWith(expect.any(String));
                expect(JSON.parse(mockInfo.mock.calls[0][0])).toEqual({
                    aws_region: mockEnv.AWS_REGION,
                    function_name: mockEnv.AWS_LAMBDA_FUNCTION_NAME,
                    function_version: mockEnv.AWS_LAMBDA_FUNCTION_VERSION,
                    function_memory_size: 128,
                    stage: mockEnv.SERVERLESS_STAGE,
                    xray_trace_id: "xray-123",
                    aws_request_id: "aws-request-123",
                    invocation_num: 1,
                    correlation_id: "876",
                    level: "INFO",
                    message: "text",
                    module: "LoggerTest",
                    timestamp: expect.stringMatching(timestampRegEx),
                });
            });

            test('info(message, params) to CloudWatch', () => {
                // GIVEN
                const logger = new Logger({ module: "LoggerTest", format: LogFormat.STRUCT });

                // WHEN
                logger.info('text', 1, true, new TypeError("third"));

                // THEN
                expect(mockInfo).toHaveBeenCalledWith(expect.any(String));
                expect(JSON.parse(mockInfo.mock.calls[0][0])).toEqual({
                    aws_region: mockEnv.AWS_REGION,
                    function_name: mockEnv.AWS_LAMBDA_FUNCTION_NAME,
                    function_version: mockEnv.AWS_LAMBDA_FUNCTION_VERSION,
                    function_memory_size: 128,
                    stage: mockEnv.SERVERLESS_STAGE,
                    xray_trace_id: "xray-123",
                    aws_request_id: "aws-request-123",
                    invocation_num: 1,
                    level: "INFO",
                    module: "LoggerTest",
                    timestamp: expect.stringMatching(timestampRegEx),
                    message: "text",
                    params: [
                        1,
                        true,
                        {
                            name: "TypeError",
                            message: "third",
                            stack: expect.any(String),
                            source: expect.stringMatching(/^.+:\d+$/)
                        }
                    ]
                });
            });

            test('info(message) to CloudWatch when log level is globally WARN', () => {
                // GIVEN
                Logger.initialize({level: LogLevel.WARN});
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.info('message');

                // THEN
                expect(mockInfo).not.toHaveBeenCalled();
            });

            test('infoObject(message, object) to CloudWatch', () => {
                // GIVEN
                const obj = {message: "I'm a teapot", statusCode: 418};
                const logger = new Logger({ module: "LoggerTest", format: LogFormat.STRUCT });
                expect(logger.level).toEqual(LogLevel.DEBUG);

                // WHEN
                logger.infoObject('Formatted ', obj);

                // THEN
                expect(mockInfo).toHaveBeenCalledWith(expect.any(String));
                expect(JSON.parse(mockInfo.mock.calls[0][0])).toEqual({
                    aws_region: mockEnv.AWS_REGION,
                    function_name: mockEnv.AWS_LAMBDA_FUNCTION_NAME,
                    function_version: mockEnv.AWS_LAMBDA_FUNCTION_VERSION,
                    function_memory_size: 128,
                    stage: mockEnv.SERVERLESS_STAGE,
                    xray_trace_id: "xray-123",
                    aws_request_id: "aws-request-123",
                    invocation_num: 1,
                    level: "INFO",
                    module: "LoggerTest",
                    timestamp: expect.stringMatching(timestampRegEx),
                    message: "Formatted ",
                    value: obj
                });
            });

            test('infoObject(message) to CloudWatch when log level is NONE', () => {
                // GIVEN
                const logger = new Logger({level: LogLevel.NONE});

                // WHEN
                logger.infoObject('message', {});

                // THEN
                expect(mockInfo).not.toHaveBeenCalled();
            });
        });
    });

    describe('configured for local console environment', () => {
        beforeEach(() => {
            process.env.LOG_TO_CLOUDWATCH = 'no';
            process.env.LOG_FORMAT = "STRUCT";
            Logger = require('./logger').Logger;
        });

        describe('warn level with pretty output', () => {
            beforeEach(() => {
                Logger.initialize({
                    level: LogLevel.WARN,
                    outputLevels: true,
                    logTimestamps: true,
                    format: LogFormat.PRETTY,
                });
            });

            test('warn(message) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.warn('message');

                // THEN
                expect(mockWarn).toHaveBeenCalledWith(
                    expect.stringMatching(timestampRegEx),
                    "WARN", "LoggerTest:", "message"
                );
            });

            test('warn(message, params) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.warn('message', 1, true, 'third');

                // THEN
                expect(mockWarn).toHaveBeenCalledWith(
                    expect.stringMatching(timestampRegEx),
                    "WARN", "LoggerTest:", "message", 1, true, "third"
                );
            });

            test('warn(message) to console when log level is ERROR', () => {
                // GIVEN
                const logger = new Logger({level: LogLevel.ERROR});

                // WHEN
                logger.warn('message');

                // THEN
                expect(mockWarn).not.toHaveBeenCalled();
            });

            test('warnObject(message, object) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                const obj = {message: "I'm a teapot", statusCode: 418};

                // WHEN
                logger.warnObject('Formatted ', obj);

                // THEN
                expect(mockWarn).toHaveBeenCalledWith(
                    expect.stringMatching(timestampRegEx),
                    "WARN", "LoggerTest:", "Formatted ",
                    "{\n  \"message\": \"I'm a teapot\",\n  \"statusCode\": 418\n}"
                );
            });
        });

        describe('error level with structured', () => {
            test('error(message) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.error('text');

                // THEN
                expect(mockError).toHaveBeenCalledWith(expect.any(String));
                expect(JSON.parse(mockError.mock.calls[0][0])).toEqual({
                    aws_region: mockEnv.AWS_REGION,
                    function_name: mockEnv.AWS_LAMBDA_FUNCTION_NAME,
                    function_version: mockEnv.AWS_LAMBDA_FUNCTION_VERSION,
                    function_memory_size: 128,
                    stage: mockEnv.SERVERLESS_STAGE,
                    level: "ERROR",
                    message: "text",
                    module: "LoggerTest",
                    timestamp: expect.stringMatching(timestampRegEx),
                });
            });

            test('error(message, params) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                const cyclicObject = { items: [] as any[] };
                cyclicObject.items.push({ value: 2, parent: cyclicObject });

                // WHEN
                logger.error('message', "wow", cyclicObject, new Error("cause"));

                // THEN
                expect(mockError).toHaveBeenCalledWith(expect.any(String));
                expect(JSON.parse(mockError.mock.calls[0][0])).toEqual({
                    aws_region: mockEnv.AWS_REGION,
                    function_name: mockEnv.AWS_LAMBDA_FUNCTION_NAME,
                    function_version: mockEnv.AWS_LAMBDA_FUNCTION_VERSION,
                    function_memory_size: 128,
                    stage: mockEnv.SERVERLESS_STAGE,
                    level: "ERROR",
                    module: "LoggerTest",
                    timestamp: expect.stringMatching(timestampRegEx),
                    message: "message",
                    params: [
                        "wow",
                        {items: [{value: 2, parent: "<cyclic>"}]},
                        {
                            name: "Error",
                            message: "cause",
                            stack: expect.any(String),
                            source: expect.stringMatching(/^.+:\d+$/)
                        }
                    ]
                });
            });

            test('error(Error) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");

                // WHEN
                logger.error(new TypeError("Bad Request"));

                // THEN
                expect(mockError).toHaveBeenCalledWith(expect.any(String));
                expect(JSON.parse(mockError.mock.calls[0][0])).toEqual({
                    aws_region: mockEnv.AWS_REGION,
                    function_name: mockEnv.AWS_LAMBDA_FUNCTION_NAME,
                    function_version: mockEnv.AWS_LAMBDA_FUNCTION_VERSION,
                    function_memory_size: 128,
                    stage: mockEnv.SERVERLESS_STAGE,
                    level: "ERROR",
                    module: "LoggerTest",
                    timestamp: expect.stringMatching(timestampRegEx),
                    message: "TypeError: Bad Request",
                    value: {
                        name: "TypeError",
                        message: "Bad Request",
                        stack: expect.any(String),
                        source: expect.stringMatching(/^.+:\d+$/)
                    }
                });
            });

            test('error(message) to console when log level is NONE', () => {
                // GIVEN
                const logger = new Logger({level: LogLevel.NONE});

                // WHEN
                logger.warn('message');

                // THEN
                expect(mockError).not.toHaveBeenCalled();
            });

            test('errorObject(message, object) to console', () => {
                // GIVEN
                const logger = new Logger("LoggerTest");
                const obj = {message: "I'm a teapot", statusCode: 418};

                // WHEN
                logger.errorObject('Formatted ', obj);

                // THEN
                expect(mockError).toHaveBeenCalledWith(expect.any(String));
                expect(JSON.parse(mockError.mock.calls[0][0])).toEqual({
                    aws_region: mockEnv.AWS_REGION,
                    function_name: mockEnv.AWS_LAMBDA_FUNCTION_NAME,
                    function_version: mockEnv.AWS_LAMBDA_FUNCTION_VERSION,
                    function_memory_size: 128,
                    stage: mockEnv.SERVERLESS_STAGE,
                    level: "ERROR",
                    module: "LoggerTest",
                    timestamp: expect.stringMatching(timestampRegEx),
                    message: "Formatted ",
                    value: obj
                });
            });
        });
    });
});
