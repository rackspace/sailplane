import middy from "@middy/core";
import {APIGatewayProxyEventAnyVersion, APIGatewayProxyResultAnyVersion} from "./types";

/**
 * Middleware to allow an async handler to return its exact response body.
 * This middleware will wrap it up as an APIGatewayProxyResult.
 * Must be registered as the last (thus first to run) "after" middleware.
 */
export const resolvedPromiseIsSuccessMiddleware = (): middy.MiddlewareObj<APIGatewayProxyEventAnyVersion, APIGatewayProxyResultAnyVersion> => ({
    after: async (request) => {
        // If response isn't a proper API result object, convert it into one.
        let response = request.response;
        if (!response || typeof response !== 'object' || (!response.statusCode && !response.body)) {
            request.response = {
                statusCode: 200,
                body: response ? JSON.stringify(response) : ''
            };
        }
    }
});
