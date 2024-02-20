import middy from "@middy/core";
import {APIGatewayProxyEventAnyVersion, APIGatewayProxyResultAnyVersion} from "./types";
import {Logger} from "@sailplane/logger";

const logger = new Logger('lambda-utils');

/**
 * Middleware to handle any otherwise unhandled exception by logging it and generating
 * an HTTP 500 response.
 *
 * Fine-tuned to work better than the Middy version, and uses @sailplane/logger.
 */
export const unhandledExceptionMiddleware = (): middy.MiddlewareObj<APIGatewayProxyEventAnyVersion, APIGatewayProxyResultAnyVersion> => ({
    onError: async (request) => {
        logger.error('Unhandled exception:', request.error);

        request.response = request.response || {};
        /* istanbul ignore else - nominal path is for response to be brand new */
        if ((request.response.statusCode || 0) < 400) {
            const error = findRootCause(request.error);
            request.response.statusCode = (error as ErrorWithStatus)?.statusCode || 500;
            request.response.body = error?.toString() ?? '';
            request.response.headers = request.response.headers ?? {};
            request.response.headers["content-type"] = "text/plain; charset=utf-8";
        }

        logger.info("Response to API Gateway: ", request.response);
    }
});

type ErrorWithStatus = Error & { statusCode?: number };

function findRootCause(error: unknown | null | undefined): ErrorWithStatus | Error | unknown | null | undefined {
    const errorWithStatus = error as ErrorWithStatus;
    if (errorWithStatus?.statusCode && errorWithStatus.statusCode >= 400) {
        return error as ErrorWithStatus;
    } else if (errorWithStatus?.cause) {
        return findRootCause(errorWithStatus.cause);
    } else {
        return error;
    }
}
