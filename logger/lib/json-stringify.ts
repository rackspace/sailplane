const stackLineExtractRegex = /\((.*):(\d+):(\d+)\)\\?$/;
/**
 * Extract the file and line where an Error was created from its stack trace.
 */
function extractErrorSource(stack?: string): string {
    for (const stackLine of stack?.split('\n') ?? []) {
        const match = stackLineExtractRegex.exec(stackLine);
        if (Array.isArray(match)) {
            return `${match[1]}:${Number(match[2])}`;
        }
    }

    return '';
}

/**
 * Enhanced replacer for JSON.stringify
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
 */
const getReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return "<cyclic>";
            }
            seen.add(value);
        }

        if (value instanceof Error) {
            const error = value as Error;
            value = {
                name: error.name,
                message: error.message,
                stack: error.stack,
                source: extractErrorSource(error.stack),
            };
        } else if (typeof value === 'bigint') {
            value = value.toString();
        }

        return value;
    };
};

/**
 * Custom version of JSON.stringify that
 * - doesn't fail on cyclic objects
 * - formats Error objects
 * - indents if LogFormat is PRETTY
 */
export function jsonStringify(obj: any, indent?: number): string {
    return JSON.stringify(obj, getReplacer(), indent);
}
