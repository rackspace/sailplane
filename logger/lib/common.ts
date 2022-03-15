export enum LogLevel {
    NONE = 1, ERROR, WARN, INFO, DEBUG
}

export enum LogFormat {
    FLAT = 1, PRETTY, STRUCT
}

export type LoggerAttributes = Record<string, string | number>;

/**
 * Signature of a Formatter function.
 * @param loggerConfig configuration of Logger instance
 * @param globalConfig global configuration
 * @param level logging level
 * @param message text to log
 * @param params A list of JavaScript objects to output.
 * @return array to pass to a console function
 */
export type FormatterFn = (
    loggerConfig: LoggerConfig,
    globalConfig: LoggerConfig,
    level: LogLevel,
    message: string,
    params: any[]
) => any[];

/**
 * Configuration of a Logger.
 * See individual properties for details.
 * The default behavior of some vary based on runtime environment.
 * Some properties may be initialized via environment variables.
 * Configuration for all loggers may be set via the Logger.initialize(config) function.
 * Overrides for individual Loggers may be given in the constructor.
 */
export interface LoggerConfig {
    /**
     * Source module of the logger - prepended to each line.
     * Source file name or class name are good choices, but can be any label.
     */
    module: string;

    /**
     * Enabled logging level.
     * May be initialized via LOG_LEVEL environment variable.
     */
    level: LogLevel;

    /** Any additional context attributes to include with _structured_ format (only). */
    attributes?: LoggerAttributes;

    /**
     * Include the level in log output?
     * Defaults to true if not streaming to CloudWatch;
     * always included with _structured_ format.
     */
    outputLevels: boolean;

    /**
     * Include timestamps in log output?
     * Defaults to false if streaming to CloudWatch (CloudWatch provides timestamps.),
     * true otherwise; always included with _structured_ format.
     * May override by setting the LOG_TIMESTAMPS environment variable to 'true' or 'false'.
     */
    logTimestamps: boolean;

    /**
     * Output format to use.
     * Defaults to FLAT if streaming to CloudWatch, PRETTY otherwise.
     * (Best to let CloudWatch provide its own pretty formatting.)
     * May initialize by setting the LOG_FORMAT environment variable to
     * "FLAT", "PRETTY", or "STRUCT".
     */
    format: LogFormat;

    /**
     * Function use to format output. Set based on format property, but may
     * be programmatically set instead.
     */
    formatter: FormatterFn;
}
