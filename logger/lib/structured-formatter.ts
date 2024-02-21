import { FormatterFn, LoggerConfig, LogLevel } from "./common";
import { jsonStringify } from "./json-stringify";
import { getContext } from "./context";

/**
 * Format a log line in flat format.
 *
 * @param loggerConfig configuration of Logger instance
 * @param globalConfig global configuration
 * @param level logging level
 * @param message text to log
 * @param params A list of JavaScript objects to output.
 * @return array to pass to a console function
 */
export const structuredFormatter: FormatterFn = (
    loggerConfig: LoggerConfig,
    globalConfig: LoggerConfig,
    level: LogLevel,
    message: string,
    params: any[]
): any[] => {
    const item = {
        ...getContext(),
        ...globalConfig.attributes,
        ...(globalConfig.attributesCallback?.()),
        ...loggerConfig.attributes,
        ...(loggerConfig.attributesCallback?.()),
        level: LogLevel[level],
        module: loggerConfig.module,
        timestamp: new Date().toISOString(),
        message,
    };

    if (params.length) {
        if (params.length === 1 && typeof params[0] === 'object') {
            item.value = params[0];
        } else {
            item.params = params;
        }
    }

    return [jsonStringify(item)];
};
