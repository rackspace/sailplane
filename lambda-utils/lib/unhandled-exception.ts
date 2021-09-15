import middy from "@middy/core";
import {APIGatewayProxyEventAnyVersion, APIGatewayProxyResultAnyVersion} from "./types";
import {Logger} from "@sailplane/logger";

const logger = new Logger('lambda-utils');

/**
 * Middleware to handle any otherwise unhandled exception by logging it and generating
 * an HTTP 500 response.
 *
 * Fine tuned to work better than the Middy version, and uses @sailplane/logger.
 */
export const unhandledExceptionMiddleware = (): middy.MiddlewareObj<APIGatewayProxyEventAnyVersion, APIGatewayProxyResultAnyVersion> => ({
    onError: async (request) => {
        logger.error('Unhandled exception:', request.error);

        request.response = request.response || {};
        /* istanbul ignore else - nominal path is for response to be brand new*/
        if ((request.response.statusCode || 0) < 400) {
            request.response.statusCode = (request.error as any)?.statusCode ?? 500;
            request.response.body = request.error?.toString() ?? '';
        }

        logger.infoObject("Response to API Gateway: ", request.response);
    }
});
