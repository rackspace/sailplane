export declare enum LogLevels {
    NONE = 1,
    ERROR = 2,
    WARN = 3,
    INFO = 4,
    DEBUG = 5
}
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
export declare class Logger {
    private category;
    /**
     * Global logging level.
     * May be initialized via LOG_LEVEL environment variable, or set by code.
     */
    static globalLogLevel: LogLevels;
    /**
     * Include the level in log output?
     * Defaults to true if not streaming to CloudWatch or running Node.js v9 or older.
     * May also be set directly by code.
     * Note: AWS behavior changed with nodejs10.x runtime - it now includes log levels automatically.
     */
    static outputLevels: boolean;
    /**
     * Include timestamps in log output?
     * Defaults to false if streaming to CloudWatch, true otherwise.
     * (CloudWatch provides timestamps.)
     * May override by setting the LOG_TIMESTAMPS environment variable to 'true' or 'false',
     * or set by code.
     */
    static logTimestamps: boolean;
    /**
     * Pretty format objects when stringified to JSON?
     * Defaults to false if streaming to CloudWatch, true otherwise.
     * (Best to let CloudWatch provide the formatting.)
     * May override by setting the LOG_FORMAT_OBJECTS environment variable to 'true' or 'false',
     * or set by code.
     */
    static formatObjects: boolean;
    /**
     * Construct.
     * @param category logging category to include in each line.
     *                 Source file name or class name are good choices.
     */
    constructor(category: string);
    /**
     * Format a log line. Helper for #debug, #info, #warn, and #error.
     *
     * @param level logging level
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     * @return array to pass to a console function, or null to output nothing.
     */
    private formatLog;
    /**
     * Format a log ine with a stringified object.
     * Helper for #debugObject, #infoObject, #warnObject, and #errorObject.
     *
     * @param level logging level
     * @param message text to log - may want to end with a space,
     *                as `{` will immediately follow.
     * @param object object to stringify to JSON and append to message
     * @return array to pass to a console function, or null to output nothing.
     */
    private formatLogStringified;
    /**
     * Log a line at DEBUG level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     */
    debug(message: any, ...optionalParams: any[]): void;
    /**
     * Log a line at INFO level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     */
    info(message: any, ...optionalParams: any[]): void;
    /**
     * Log a line at WARN level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     */
    warn(message: any, ...optionalParams: any[]): void;
    /**
     * Log a line at ERROR level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     */
    error(message: any, ...optionalParams: any[]): void;
    /**
     * Log a line at DEBUG level with a stringified object.
     *
     * @param message text to log - may want to end with a space,
     *                as `{` will immediately follow.
     * @param object object to stringify to JSON and append to message
     */
    debugObject(message: string, object: any): void;
    /**
     * Log a line at INFO level with a stringified object.
     *
     * @param message text to log - may want to end with a space,
     *                as `{` will immediately follow.
     * @param object object to stringify to JSON and append to message
     */
    infoObject(message: string, object: any): void;
    /**
     * Log a line at WARN level with a stringified object.
     *
     * @param message text to log - may want to end with a space,
     *                as `{` will immediately follow.
     * @param object object to stringify to JSON and append to message
     */
    warnObject(message: string, object: any): void;
    /**
     * Log a line at ERROR level with a stringified object.
     *
     * @param message text to log - may want to end with a space,
     *                as `{` will immediately follow.
     * @param object object to stringify to JSON and append to message
     */
    errorObject(message: string, object: any): void;
}
