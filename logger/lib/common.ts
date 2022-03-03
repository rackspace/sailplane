export enum LogLevel {
    NONE = 1, ERROR, WARN, INFO, DEBUG
}

export enum LogFormat {
    FLAT = 1, PRETTY, STRUCT
}

export type FormatterFn = (config: LoggerConfig, level: LogLevel, message: string, params: any[]) => any[];

export interface LoggerConfig {
    /**
     * "Category" of the logger - prepended to each line.
     * Source file name or class name are good choices.
     */
    category: string;

    /**
     * Enabled logging level.
     * May be initialized via LOG_LEVEL environment variable, or set by code.
     */
    level: LogLevel;

    /** Any additional context attributes to include with _structured_ logging */
    attributes?: Record<string, string | number>;

    /**
     * Include the level in log output?
     * Defaults to true if not streaming to CloudWatch.
     * May also be set directly by code.
     */
    outputLevels: boolean;

    /**
     * Include timestamps in log output?
     * Defaults to false if streaming to CloudWatch, true otherwise.
     * (CloudWatch provides timestamps.)
     * May override by setting the LOG_TIMESTAMPS environment variable to 'true' or 'false',
     * or set by code.
     */
    logTimestamps: boolean;

    /**
     * Output format to use.
     * Defaults to FLAT if streaming to CloudWatch, PRETTY otherwise.
     * (Best to let CloudWatch provide the formatting.)
     * May override by setting the LOG_FORMAT environment variable to
     * "FLAT", "PRETTY", or "STRUCT" or set by code.
     */
    format: LogFormat;

    /**
     * Function use to format output. Set based on format property, but may
     * be programmatically set instead.
     */
    formatter: FormatterFn;
}
