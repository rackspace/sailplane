import { LoggerAttributes, LoggerConfig, LogLevel } from "./common";
import { Context } from "aws-lambda";
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
export declare class Logger {
    /**
     * Configure global defaults. Individual Logger instances may override.
     * @param globalConfig configuration properties to changed - undefined properties
     *        will retain existing value
     */
    static initialize(globalConfig: Partial<LoggerConfig>): void;
    /**
     * Set some context attributes to the existing collection of global attributes
     * Use initialize({attributes: {}} to override/reset all attributes.
     */
    static addAttributes(attributes: LoggerAttributes): void;
    /**
     * Set structured logging global attributes based on Lambda Context:
     *
     * - aws_request_id: identifier of the invocation request
     * - invocation_num: number of invocations of this process (1 = cold start)
     *
     * Call this every time the Lambda handler begins.
     */
    static setLambdaContext(context: Context): void;
    private readonly config;
    /**
     * Construct.
     * @param ops LoggerConfig, or just module name as string
     */
    constructor(ops: string | Partial<LoggerConfig>);
    /**
     * The Log Level of this Logger
     */
    get level(): LogLevel;
    /**
     * Log an item at given level.
     * Usually better to use the specific function per log level instead.
     *
     * @param level log level
     * @param message text to log
     * @param params A list of JavaScript objects to output
     */
    log(level: LogLevel, message: string, params: any[]): void;
    /**
     * Log a line at DEBUG level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     */
    debug(message: string, ...optionalParams: any[]): void;
    /**
     * Log a line at INFO level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     */
    info(message: string, ...optionalParams: any[]): void;
    /**
     * Log a line at WARN level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     */
    warn(message: string, ...optionalParams: any[]): void;
    /**
     * Log a line at ERROR level.
     *
     * @param message text or Error instance
     * @param optionalParams A list of JavaScript objects to output.
     */
    error(message: string | Error, ...optionalParams: any[]): void;
    /**
     * Log a line at DEBUG level with a stringified object.
     *
     * @param message text to log
     * @param object a Javascript object to output
     * @deprecated #debug has the same result now
     */
    debugObject(message: string, object: any): void;
    /**
     * Log a line at INFO level with a stringified object.
     *
     * @param message text to log
     * @param object a Javascript object to output
     * @deprecated #info has the same result now
     */
    infoObject(message: string, object: any): void;
    /**
     * Log a line at WARN level with a stringified object.
     *
     * @param message text to log
     * @param object a Javascript object to output
     * @deprecated #warn has the same result now
     */
    warnObject(message: string, object: any): void;
    /**
     * Log a line at ERROR level with a stringified object.
     *
     * @param message text to log
     * @param object a Javascript object to output
     * @deprecated #error has the same result now
     */
    errorObject(message: string, object: any): void;
}
