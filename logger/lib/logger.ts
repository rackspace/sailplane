import { LogFormat, LoggerConfig, LogLevel } from "./common";
import { structuredFormatter } from "./structured-formatter";
import { flatFormatter } from "./flat-formatter";

// TODO: sampleRate
// TODO: tripwire
// TODO: context from Lambda - context.awsRequestId - add to LambdaUtils project
//  https://github.com/awslabs/aws-lambda-powertools-typescript/blob/main/packages/logger/src/middleware/middy.ts
//  https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html

// If not running in an interactive shell (such is the case for AWS Lambda environment)
// or the LOG_TO_CLOUDWATCH environment is set, then format output for CloudWatch.
const IsCloudWatch = process.env.LOG_TO_CLOUDWATCH ? process.env.LOG_TO_CLOUDWATCH === 'true' : !process.env.SHELL;
const globalFormat: LogFormat = LogFormat[process.env.LOG_FORMAT!] || IsCloudWatch ? LogFormat.FLAT : LogFormat.PRETTY;
const globalLoggerConfig: LoggerConfig = {
    category: "global",
    level: LogLevel[process.env.LOG_LEVEL!] || LogLevel.DEBUG,
    outputLevels: !IsCloudWatch,
    logTimestamps: process.env.LOG_TIMESTAMPS ? process.env.LOG_TIMESTAMPS === 'true' : !IsCloudWatch,
    format: globalFormat,
    // @ts-ignore - TS thinks value can't be STRUCT, which is not true
    formatter: globalFormat === LogFormat.STRUCT ? structuredFormatter : flatFormatter,
}

const levelConsoleFnMap: Record<LogLevel, Function> = {
    [LogLevel.NONE]: () => {},
    [LogLevel.DEBUG]: console.debug,
    [LogLevel.INFO]: console.info,
    [LogLevel.WARN]: console.warn,
    [LogLevel.ERROR]: console.error,
};

/**
 * Custom logger class.
 *
 * Works much like console's logging, but includes levels, date/time,
 * and category (file) on each line.
 *
 * Usage:
 *   import {Logger} from "@sailplane/logger";
 *   const logger = new Logger('name-of-module');
 *   logger.info("Hello World!");
 */
export class Logger {
    /** Configure global defaults. Individual Logger instances may override. */
    static initialize(globalConfig: Partial<LoggerConfig>): void {
        Object.assign(globalLoggerConfig, globalConfig);
        globalLoggerConfig.formatter = globalLoggerConfig.format === LogFormat.STRUCT
            ? structuredFormatter : flatFormatter;
    }

    private readonly config: LoggerConfig;

    /**
     * Construct.
     * @param ops LoggerConfig, or just category as string
     */
    constructor(ops: string | LoggerConfig) {
        if (typeof ops === "string") {
            this.config = {...globalLoggerConfig, category: ops};
        } else {
            this.config = {...globalLoggerConfig, ...ops};
            if (ops.format && !ops.formatter) {
                this.config.formatter = ops.format === LogFormat.STRUCT ? structuredFormatter : flatFormatter;
            }
        }
    }

    /** The Log Level of this Logger */
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
            const content = this.config.formatter(this.config, level, message, params);
            if (content) {
                levelConsoleFnMap[level](...content);
            }
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
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     */
    error(message: string, ...optionalParams: any[]): void {
        this.log(LogLevel.ERROR, message, optionalParams);
    }

    /**
     * Log a line at DEBUG level with a stringified object.
     *
     * @param message text to log
     * @param object a Javascript object to output
     */
    debugObject(message: string, object: any): void {
        this.log(LogLevel.DEBUG, message, [object]);
    }

    /**
     * Log a line at INFO level with a stringified object.
     *
     * @param message text to log
     * @param object a Javascript object to output
     */
    infoObject(message: string, object: any): void {
        this.log(LogLevel.INFO, message, [object]);
    }

    /**
     * Log a line at WARN level with a stringified object.
     *
     * @param message text to log
     * @param object a Javascript object to output
     */
    warnObject(message: string, object: any): void {
        this.log(LogLevel.WARN, message, [object]);
    }

    /**
     * Log a line at ERROR level with a stringified object.
     *
     * @param message text to log
     * @param object a Javascript object to output
     */
    errorObject(message: string, object: any): void {
        this.log(LogLevel.ERROR, message, [object]);
    }
}
