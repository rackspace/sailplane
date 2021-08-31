import {
    APIGatewayProxyEvent as AWS_APIGatewayProxyEvent,
    APIGatewayProxyEventV2 as AWS_APIGatewayProxyEventV2,
    APIGatewayProxyResult,
    APIGatewayProxyStructuredResultV2,
    Callback,
    Context
} from "aws-lambda";

import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import {Logger} from "@sailplane/logger";

const logger = new Logger('lambda-utils');

/**
 * Casted interface for APIGatewayProxyEvents as converted through the middleware
 */
export interface APIGatewayProxyEvent extends AWS_APIGatewayProxyEvent {
    /**
     * HTTP Request body, parsed from a JSON string into an object.
     */
    body: any | null;

    /**
     * HTTP Path Parameters, always defined, never null
     */
    pathParameters: { [name: string]: string };

    /**
     * HTTP URL query string parameters, always defined, never null
     */
    queryStringParameters: { [name: string]: string };
}

export type APIGatewayProxyEventV1 = APIGatewayProxyEvent;

/**
 * Casted interface for APIGatewayProxyEventsV2 as converted through the middleware
 */
export interface APIGatewayProxyEventV2 extends AWS_APIGatewayProxyEventV2 {
    /**
     * HTTP Request body, parsed from a JSON string into an object.
     */
    body: any | null;

    /**
     * HTTP Path Parameters, always defined, never null
     */
    pathParameters: { [name: string]: string };

    /**
     * HTTP URL query string parameters, always defined, never null
     */
    queryStringParameters: { [name: string]: string };
}

type APIGatewayProxyEventAnyVersion = AWS_APIGatewayProxyEvent | AWS_APIGatewayProxyEventV2;
type APIGatewayProxyResultAnyVersion = APIGatewayProxyResult | APIGatewayProxyStructuredResultV2;

/**
 * Define the async version of ProxyHandler for either V1 or V2 payload format.
 */
export type AsyncProxyHandlerAnyVersion = (event: AWS_APIGatewayProxyEvent | AWS_APIGatewayProxyEventV2, context: Context) => Promise<any>;

/**
 * Middleware to handle any otherwise unhandled exception by logging it and generating
 * an HTTP 500 response.
 *
 * Fine tuned to work better than the Middy version, and uses @sailplane/logger.
 */
export const unhandledExceptionMiddleware = <TEvent extends APIGatewayProxyEventAnyVersion, TResult extends APIGatewayProxyResultAnyVersion>(): middy.MiddlewareObj<TEvent, TResult> => ({
    onError: async (request): Promise<void> => {
        logger.error('Unhandled exception:', request.error);

        request.response = request.response || {} as TResult;
        /* istanbul ignore else - nominal path is for response to be brand new*/
        if ((request.response.statusCode || 0) < 400) {
            request.response.statusCode = (request.error as any)?.statusCode ?? 500;
            request.response.body = request.error?.toString() ?? '';
        }

        logger.infoObject("Response to API Gateway: ", request.response);
    }
});

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

/**
 * Wrap an API Gateway proxy lambda function handler to add features:
 * - Set CORS headers.
 * - Normalize incoming headers to lowercase
 * - If incoming content is JSON text, replace event.body with parsed object.
 * - Ensures that event.queryStringParameters and event.pathParameters are defined,
 *   to avoid TypeErrors.
 * - Ensures that handler response is formatted properly as a successful
 *   API Gateway result.
 * - Catch http-errors exceptions into proper HTTP responses.
 * - Catch other exceptions and return as HTTP 500
 *
 * This wrapper includes commonly useful middleware. You may further wrap it
 * with your own function that adds additional middleware, or just use it as
 * an example.
 *
 * @param handler async function to wrap
 * @see https://middy.js.org/#:~:text=available%20middlewares
 * @see https://www.npmjs.com/package/http-errors
 */
export function wrapApiHandler<TEvent extends APIGatewayProxyEventAnyVersion, TResult extends APIGatewayProxyResultAnyVersion>(
    handler: (event: TEvent, context: Context, callback?: Callback<TResult>) => Promise<TResult>
) : middy.MiddyfiedHandler<TEvent, TResult> {
    return middy(handler)
        .use(httpEventNormalizer()).use(httpHeaderNormalizer()).use(httpJsonBodyParser())
        .use(cors())
        .use(resolvedPromiseIsSuccessMiddleware<TEvent, TResult>())
        .use(unhandledExceptionMiddleware<TEvent, TResult>());
}

/**
 * Construct the object that API Gateway payload format v1 wants back
 * upon a successful run. (HTTP 200 Ok)
 *
 * This normally is not needed. If the response is simply the content to return as the
 * body of the HTTP response, you may simply return it from the handler given to
 * #wrapApiHandler(handler). It will automatically transform the result.
 *
 * @param result object to serialize into JSON as the response body
 * @returns {APIGatewayProxyResult}
 */
export function apiSuccess(result?: any): APIGatewayProxyResult {
    return {
        statusCode: 200,
        body: result ? JSON.stringify(result) : ''
    };
}

/**
 * Construct the object that API Gateway payload format v1 wants back upon a failed run.
 *
 * Often, it is simpler to throw an http-errors exception from your #wrapApiHandler
 * handler.
 *
 * @see https://www.npmjs.com/package/http-errors
 * @param statusCode HTTP status code, between 400 and 599.
 * @param message string to return in the response body
 * @returns {APIGatewayProxyResult}
 */
export function apiFailure(statusCode: number, message?: string): APIGatewayProxyResult {
    const response = {
        statusCode,
        body: message || ''
    };

    logger.warnObject("Response to API Gateway: ", response);
    return response;
}
