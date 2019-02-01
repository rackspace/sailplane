
export enum LogLevels {
    ERROR, WARN, INFO, DEBUG
}

const LogLevelsMap = {
    'ERROR': LogLevels.ERROR,
    'WARN': LogLevels.WARN,
    'INFO': LogLevels.INFO,
    'DEBUG': LogLevels.DEBUG
};

// Detect serverless-offline - impacts default config
const IsServerlessOffline = (process.env.IS_OFFLINE === 'true');

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
    /**
     * Global logging level.
     * May be initialized via LOG_LEVEL environment variable, or set by code.
     */
    static globalLogLevel: LogLevels = LogLevelsMap[process.env.LOG_LEVEL||'DEBUG'] || LogLevels.DEBUG;

    /**
     * Include timestamps in log output?
     * Defaults to true if serverless-offline environment detected, false otherwise.
     * (CloudWatch provides timestamps.)
     * May enable by setting the LOG_TIMESTAMPS environment variable to any value,
     * or set by code.
     */
    static logTimestamps = IsServerlessOffline || !!process.env.LOG_TIMESTAMPS;

    /**
     * Pretty format objects when stringified to JSON?
     * Defaults to true if serverless-offline environment detected, false otherwise.
     * (Best to let CloudWatch provide the formatting.)
     * May enable by setting the LOG_FORMAT_OBJECTS environment variable to any value,
     * or set by code.
     */
    static formatObjects = IsServerlessOffline || !!process.env.LOG_FORMAT_OBJECTS;

    /**
     * Construct.
     * @param category logging category to include in each line.
     *                 Source file name or class name are good choices.
     */
    constructor(private category: string) {
    }

    /**
     * Log a line. Usually better to use #debug, #info, #warn, or #error instead.
     *
     * @param level logging level
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     */
    log(level: LogLevels, message: any, optionalParams: any[]): void {
        if (level > Logger.globalLogLevel)
            return;

        // Only add timestamp on console output. CloudWatch tags the time on its own.
        const prefix =
            (Logger.logTimestamps ? new Date().toISOString().substr(0,19) + ' ' : '')
            + LogLevels[level] + ' ' + this.category + ': ';

        if (typeof message === 'string') {
            console.log(prefix + message, ...optionalParams);
        }
        else {
            console.log(prefix, message, ...optionalParams);
        }
    }

    /**
     * Log a line with a stringified object.
     * Usually better to use #debugObject, #infoObject, #warnObject, or #errorObject
     * instead.
     *
     * @param level logging level
     * @param message text to log - may want to end with a space,
     *                as `{` will immediately follow.
     * @param object object to stringify to JSON and append to message
     */
    logStringified(level: LogLevels, message: string, object: any): void {
        // In local console environment, pretty format the object; in AWS, allow CloudWatch to format it.
        const objStr = Logger.formatObjects ? JSON.stringify(object,null,2) : JSON.stringify(object);
        this.log(level, message + objStr, []);
    }

    /**
     * Log a line at DEBUG level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     */
    debug(message: any, ...optionalParams: any[]): void {
        this.log(LogLevels.DEBUG, message, optionalParams);
    }

    /**
     * Log a line at INFO level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     */
    info(message: any, ...optionalParams: any[]): void {
        this.log(LogLevels.INFO, message, optionalParams);
    }

    /**
     * Log a line at WARN level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     */
    warn(message: any, ...optionalParams: any[]): void {
        this.log(LogLevels.WARN, message, optionalParams);
    }

    /**
     * Log a line at ERROR level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     */
    error(message: any, ...optionalParams: any[]): void {
        this.log(LogLevels.ERROR, message, optionalParams);
    }

    /**
     * Log a line at DEBUG level with a stringified object.
     *
     * @param message text to log - may want to end with a space,
     *                as `{` will immediately follow.
     * @param object object to stringify to JSON and append to message
     */
    debugObject(message: string, object: any): void {
        this.logStringified(LogLevels.DEBUG, message, object);
    }

    /**
     * Log a line at INFO level with a stringified object.
     *
     * @param message text to log - may want to end with a space,
     *                as `{` will immediately follow.
     * @param object object to stringify to JSON and append to message
     */
    infoObject(message: string, object: any): void {
        this.logStringified(LogLevels.INFO, message, object);
    }

    /**
     * Log a line at WARN level with a stringified object.
     *
     * @param message text to log - may want to end with a space,
     *                as `{` will immediately follow.
     * @param object object to stringify to JSON and append to message
     */
    warnObject(message: string, object: any): void {
        this.logStringified(LogLevels.WARN, message, object);
    }

    /**
     * Log a line at ERROR level with a stringified object.
     *
     * @param message text to log - may want to end with a space,
     *                as `{` will immediately follow.
     * @param object object to stringify to JSON and append to message
     */
    errorObject(message: string, object: any): void {
        this.logStringified(LogLevels.ERROR, message, object);
    }
}
