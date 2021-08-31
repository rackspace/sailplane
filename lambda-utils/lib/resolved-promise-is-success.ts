import middy from "@middy/core";
import {APIGatewayProxyEventAnyVersion, APIGatewayProxyResultAnyVersion} from "./types";

/**
 * Middleware to allow an async handler to return its exact response body.
 * This middleware will wrap it up as an APIGatewayProxyResult.
 * Must be registered as the last (thus first to run) "after" middleware.
 */
export const resolvedPromiseIsSuccessMiddleware = <TEvent extends APIGatewayProxyEventAnyVersion, TResult extends APIGatewayProxyResultAnyVersion>(): middy.MiddlewareObj<TEvent, TResult> => ({
    after: async (request): Promise<void> => {
        // If response isn't a proper API result object, convert it into one.
        let response = request.response as TResult;
        if (!response || typeof response !== 'object' || (!response.statusCode && !response.body)) {
            request.response = {
                statusCode: 200,
                body: response ? JSON.stringify(response) : ''
            } as TResult;
        }
    }
});

