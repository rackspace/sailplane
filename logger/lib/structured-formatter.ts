import { FormatterFn, LoggerConfig, LogLevel } from "./common";
import { jsonStringify } from "./json-stringify";

/**
 * Log context based on runtime environment.
 * @see https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-runtime
 */
let envContext: any | undefined;

function getEnvironment(): any {
    if (!envContext) {
        const addIfExists = (name: string, value: string | undefined, notValue?: string) => {
            if (value && value !== notValue) {
                envContext[name] = value;
            }
        };
        envContext = {
            aws_region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
            function_name: process.env.AWS_LAMBDA_FUNCTION_NAME,
            function_version: process.env.AWS_LAMBDA_FUNCTION_VERSION,
            // function_memory_size: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
        };
        // addIfExists("function_version", process.env.AWS_LAMBDA_FUNCTION_VERSION, "$LATEST");
        addIfExists("environment", process.env.ENVIRONMENT);
        addIfExists("stage", process.env.STAGE || process.env.SERVERLESS_STAGE);
        addIfExists("xray_trace_id", process.env._X_AMZN_TRACE_ID);
    }
    return envContext;
}

/**
 * Format a log line in flat format.
 *
 * @param config configuration
 * @param level logging level
 * @param message text to log
 * @param params A list of JavaScript objects to output.
 * @return array to pass to a console function, or null to output nothing.
 */
export const structuredFormatter: FormatterFn = (config: LoggerConfig, level: LogLevel, message: string, params: any[]): any[] => {
    const item = {
        ...getEnvironment(),
        ...config.attributes,
        level: LogLevel[level],
        category: config.category,
        timestamp: new Date().toISOString().substr(0, 19),
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
