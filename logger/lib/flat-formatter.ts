import {FormatterFn, LogFormat, LoggerConfig, LogLevel} from "./common";
import {jsonStringify} from "./json-stringify";

/**
 * Format a log line in flat or pretty format.
 *
 * @param loggerConfig configuration of Logger instance
 * @param globalConfig global configuration
 * @param level logging level
 * @param message text to log
 * @param params A list of JavaScript objects to output.
 * @return array to pass to a console function
 */
export const flatFormatter: FormatterFn = (
    loggerConfig: LoggerConfig,
    globalConfig: LoggerConfig,
    level: LogLevel,
    message: string,
    params: any[]
): any[] => {
    const out: any[] = [];
    if (loggerConfig.logTimestamps) {
        out.push(new Date().toISOString().substr(0, 19));
    }

    if (loggerConfig.outputLevels) {
        out.push(LogLevel[level]);
    }

    out.push(loggerConfig.module);

    out.push(...Object.values({
        ...(globalConfig.attributesCallback?.()),
        ...(loggerConfig.attributesCallback?.()),
    }));

    out[out.length - 1] += ":";
    out.push(message);

    if (params.length) {
        const indent = loggerConfig.format === LogFormat.PRETTY ? 2 : undefined;
        for (const param of params) {
            if (typeof param === 'object') {
                out.push(jsonStringify(param, indent));
            } else {
                out.push(param);
            }
        }
    }

    return out;
}
