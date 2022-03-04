import { FormatterFn, LogFormat, LoggerConfig, LogLevel } from "./common";
import { structuredFormatter } from "./structured-formatter";
import { flatFormatter } from "./flat-formatter";

// TODO: sampleRate
// TODO: tripwire
// TODO: context from Lambda - context.awsRequestId - add to LambdaUtils project
//  https://github.com/awslabs/aws-lambda-powertools-typescript/blob/main/packages/logger/src/middleware/middy.ts
//  https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html

const levelConsoleFnMap: Record<LogLevel, Function> = {
    /* istanbul ignore next - not used but must be defined */
    [LogLevel.NONE]: () => {},
    [LogLevel.DEBUG]: console.debug,
    [LogLevel.INFO]: console.info,
    [LogLevel.WARN]: console.warn,
    [LogLevel.ERROR]: console.error,
};

const formatterFnMap: Record<LogFormat, FormatterFn> = {
    [LogFormat.FLAT]: flatFormatter,
    [LogFormat.PRETTY]: flatFormatter, // handles pretty too
    [LogFormat.STRUCT]: structuredFormatter,
};

// If not running in an interactive shell (such is the case for AWS Lambda environment)
// or the LOG_TO_CLOUDWATCH environment is set, then format output for CloudWatch.
const IsCloudWatch = process.env.LOG_TO_CLOUDWATCH ? process.env.LOG_TO_CLOUDWATCH === 'true' : !process.env.SHELL;
const globalFormat: LogFormat = LogFormat[process.env.LOG_FORMAT!] || (IsCloudWatch ? LogFormat.FLAT : LogFormat.PRETTY);
const globalLoggerConfig: LoggerConfig = {
    module: "global",
    level: LogLevel[process.env.LOG_LEVEL!] || LogLevel.DEBUG,
    outputLevels: !IsCloudWatch,
    logTimestamps: process.env.LOG_TIMESTAMPS ? process.env.LOG_TIMESTAMPS === 'true' : !IsCloudWatch,
    format: globalFormat,
    // @ts-ignore - TS thinks value can't be STRUCT, which is not true
    formatter: formatterFnMap[globalFormat],
}

/**
 * Custom logger class.
 *
 * Works much like console's logging, but includes levels, date/time,
 * and module (file) on each line, or structured formatting if configured to do so.
 *
 * Usage:
 *   import {Logger} from "@sailplane/logger";
 *   const logger = new Logger('name-of-module');
 *   logger.info("Hello World!");
 */
export class Logger {
    /**
     * Configure global defaults. Individual Logger instances may override.
     * @param globalConfig configuration properties to changed - undefined properties
     *        will retain existing value
     */
    static initialize(globalConfig: Partial<LoggerConfig>): void {
        Object.assign(globalLoggerConfig, globalConfig);
        globalLoggerConfig.formatter = formatterFnMap[globalLoggerConfig.format];
    }

    private readonly config: LoggerConfig;

    /**
     * Construct.
     * @param ops LoggerConfig, or just module name as string
     */
    constructor(ops: string | LoggerConfig) {
        if (typeof ops === "string") {
            this.config = {...globalLoggerConfig, module: ops};
        } else {
            this.config = {...globalLoggerConfig, ...ops};
            if (ops.format && !ops.formatter) {
                this.config.formatter = formatterFnMap[ops.format];
            }
        }
    }

    /**
     * The Log Level of this Logger
     */
    get level(): LogLevel {
        return this.config.level;
    }

    /**
     * Log an item at given level.
     * Usually better to use the specific function per log level instead.
     *
     * @param level log level
     * @param message text to log
     * @param params A list of JavaScript objects to output
     */
    log(level: LogLevel, message: string, params: any[]): void {
        if (this.config.level >= level) {
            const content = this.config.formatter(this.config, globalLoggerConfig, level, message, params);
            levelConsoleFnMap[level](...content);
        }
    }

    /**
     * Log a line at DEBUG level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     */
    debug(message: string, ...optionalParams: any[]): void {
        this.log(LogLevel.DEBUG, message, optionalParams);
    }

    /**
     * Log a line at INFO level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     */
    info(message: string, ...optionalParams: any[]): void {
        this.log(LogLevel.INFO, message, optionalParams);
    }

    /**
     * Log a line at WARN level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     */
    warn(message: string, ...optionalParams: any[]): void {
        this.log(LogLevel.WARN, message, optionalParams);
    }

    /**
     * Log a line at ERROR level.
     *
     * @param message text or Error instance
     * @param optionalParams A list of JavaScript objects to output.
     */
    error(message: string|Error, ...optionalParams: any[]): void {
        if (typeof message === "object" && message instanceof Error) {
            optionalParams.push(message);
            message = message.toString();
        }
        this.log(LogLevel.ERROR, message, optionalParams);
    }

    /**
     * Log a line at DEBUG level with a stringified object.
     *
     * @param message text to log
     * @param object a Javascript object to output
     * @deprecated #debug has the same result now
     */
    debugObject(message: string, object: any): void {
        this.log(LogLevel.DEBUG, message, [object]);
    }

    /**
     * Log a line at INFO level with a stringified object.
     *
     * @param message text to log
     * @param object a Javascript object to output
     * @deprecated #info has the same result now
     */
    infoObject(message: string, object: any): void {
        this.log(LogLevel.INFO, message, [object]);
    }

    /**
     * Log a line at WARN level with a stringified object.
     *
     * @param message text to log
     * @param object a Javascript object to output
     * @deprecated #warn has the same result now
     */
    warnObject(message: string, object: any): void {
        this.log(LogLevel.WARN, message, [object]);
    }

    /**
     * Log a line at ERROR level with a stringified object.
     *
     * @param message text to log
     * @param object a Javascript object to output
     * @deprecated #error has the same result now
     */
    errorObject(message: string, object: any): void {
        this.log(LogLevel.ERROR, message, [object]);
    }
}
