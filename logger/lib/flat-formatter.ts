import { FormatterFn, LogFormat, LoggerConfig, LogLevel } from "./common";
import { jsonStringify } from "./json-stringify";

/**
 * Format a log line in flat format.
 *
 * @param config configuration
 * @param level logging level
 * @param message text to log
 * @param params A list of JavaScript objects to output.
 * @return array to pass to a console function, or null to output nothing.
 */
export const flatFormatter: FormatterFn = (config: LoggerConfig, level: LogLevel, message: string, params: any[]): any[] => {
    const out: any[] = [];
    if (config.logTimestamps) {
        out.push(new Date().toISOString().substr(0, 19));
    }

    if (config.outputLevels) {
        out.push(LogLevel[level]);
    }

    out.push(config.category + ':');
    out.push(message);
    if (params.length) {
        const indent = config.format === LogFormat.PRETTY ? 2 : undefined;
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
