import type { Context } from 'aws-lambda';

/**
 * Log context based on runtime environment and Lambda context.
 * @see https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-runtime
 * @see https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html
 */
let processContext: any | undefined;
let numInvocations = 0;
const env = globalThis.process?.env ?? {};

function initContext(): void {
    const addIfExists = (name: string, value: string | undefined, notValue?: string) => {
        if (value && value !== notValue) {
            processContext[name] = value;
        }
    };
    processContext = {
        aws_region: env.AWS_REGION || env.AWS_DEFAULT_REGION,
        function_name: env.AWS_LAMBDA_FUNCTION_NAME,
        function_memory_size: Number(env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
    };
    addIfExists("function_version", env.AWS_LAMBDA_FUNCTION_VERSION, "$LATEST");
    addIfExists("environment", env.ENVIRONMENT);
    addIfExists("stage", env.STAGE || env.SERVERLESS_STAGE);
    addIfExists("xray_trace_id",
        /*xray enabled? */env.AWS_XRAY_CONTEXT_MISSING ? env._X_AMZN_TRACE_ID : undefined
    );
}

export function getContext(): any {
    if (!processContext) {
        initContext();
    }
    return processContext;
}

export function addLambdaContext(context: Context): void {
    if (!processContext) {
        initContext();
    }

    processContext.aws_request_id = context.awsRequestId;
    processContext.invocation_num = ++numInvocations;
}
