import { APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import cors from "@middy/http-cors";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { Logger } from "@sailplane/logger";
import {
  AsyncMiddyifedHandlerV1,
  AsyncMiddyifedHandlerV2,
  AsyncProxyHandlerV1,
  AsyncProxyHandlerV2,
} from "./types";
import { resolvedPromiseIsSuccessMiddleware } from "./resolved-promise-is-success";
import { unhandledExceptionMiddleware } from "./unhandled-exception";
import { loggerContextMiddleware } from "./logger-context";

const logger = new Logger("lambda-utils");

/**
 * Wrap an API Gateway V1 format proxy lambda function handler to add features:
 * - Set CORS headers.
 * - Normalize incoming headers to lowercase
 * - If incoming content is JSON text, replace event.body with parsed object.
 * - Ensures that event.queryStringParameters and event.pathParameters are defined,
 *   to avoid TypeErrors.
 * - Ensures that handler response is formatted properly as a successful
 *   API Gateway result.
 * - Catch http-errors exceptions into proper HTTP responses.
 * - Catch other exceptions and return as HTTP 500
 * - Set Lambda invocation and API request context in @sailplane/logger
 *
 * This wrapper includes commonly useful middleware. You may further wrap it
 * with your own function that adds additional middleware, or just use it as
 * an example.
 *
 * @param handler async function to wrap
 * @see https://middy.js.org/#:~:text=available%20middlewares
 * @see https://www.npmjs.com/package/http-errors
 */
export function wrapApiHandler(handler: AsyncProxyHandlerV1): AsyncMiddyifedHandlerV1 {
  return middy(handler)
    .use(cors({ origin: "*" }))
    .use(resolvedPromiseIsSuccessMiddleware())
    .use(unhandledExceptionMiddleware())
    .use(loggerContextMiddleware())
    .use(httpEventNormalizer())
    .use(httpHeaderNormalizer())
    .use(
      // Parse JSON body, but don't throw when there is no body
      httpJsonBodyParser({ disableContentTypeError: true }),
    ) as unknown as AsyncMiddyifedHandlerV1;
}
export const wrapApiHandlerV1 = wrapApiHandler;

/**
 * Wrap an API Gateway V2 format proxy lambda function handler to add features:
 * - Set CORS headers.
 * - Normalize incoming headers to lowercase
 * - If incoming content is JSON text, replace event.body with parsed object.
 * - Ensures that event.queryStringParameters and event.pathParameters are defined,
 *   to avoid TypeErrors.
 * - Ensures that handler response is formatted properly as a successful
 *   API Gateway result.
 * - Catch http-errors exceptions into proper HTTP responses.
 * - Catch other exceptions and return as HTTP 500
 * - Set Lambda invocation and API request context in @sailplane/logger
 *
 * This wrapper includes commonly useful middleware. You may further wrap it
 * with your own function that adds additional middleware, or just use it as
 * an example.
 *
 * @param handler async function to wrap
 * @see https://middy.js.org/#:~:text=available%20middlewares
 * @see https://www.npmjs.com/package/http-errors
 */
export function wrapApiHandlerV2(handler: AsyncProxyHandlerV2): AsyncMiddyifedHandlerV2 {
  return middy(handler)
    .use(cors({ origin: "*" }))
    .use(resolvedPromiseIsSuccessMiddleware())
    .use(unhandledExceptionMiddleware())
    .use(loggerContextMiddleware())
    .use(httpEventNormalizer())
    .use(httpHeaderNormalizer())
    .use(
      // Parse JSON body, but don't throw when there is no body
      httpJsonBodyParser({ disableContentTypeError: true }),
    ) as unknown as AsyncMiddyifedHandlerV2;
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
    body: result ? JSON.stringify(result) : "",
    headers: {
      "content-type": result ? "application/json; charset=utf-8" : "text/plain; charset=utf-8",
    },
  };
}

/**
 * Construct the object that API Gateway payload format v1 wants back upon a failed run.
 *
 * Often, it is simpler to throw a http-errors exception from your #wrapApiHandler
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
    body: message || "",
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  };

  logger.warn("Response to API Gateway: ", response);
  return response;
}
