import { APIGatewayProxyEvent as AWS_APIGatewayProxyEvent, APIGatewayProxyEventV2 as AWS_APIGatewayProxyEventV2, APIGatewayProxyResult, APIGatewayProxyStructuredResultV2, Callback, Context } from "aws-lambda";
import middy from "@middy/core";
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
    pathParameters: {
        [name: string]: string;
    };
    /**
     * HTTP URL query string parameters, always defined, never null
     */
    queryStringParameters: {
        [name: string]: string;
    };
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
    pathParameters: {
        [name: string]: string;
    };
    /**
     * HTTP URL query string parameters, always defined, never null
     */
    queryStringParameters: {
        [name: string]: string;
    };
}
export type APIGatewayProxyEventAnyVersion = AWS_APIGatewayProxyEvent | APIGatewayProxyEvent | AWS_APIGatewayProxyEventV2 | APIGatewayProxyEventV2;
export type APIGatewayProxyResultAnyVersion = APIGatewayProxyResult | APIGatewayProxyStructuredResultV2;
/** LambdaUtils version of ProxyHandler for API Gateway v1 payload format */
export type AsyncProxyHandlerV1 = (event: APIGatewayProxyEvent, context: Context, callback?: Callback<APIGatewayProxyResult>) => Promise<APIGatewayProxyResult | object | void>;
/** LambdaUtils version of an API Gateway v1 payload handler wrapped with middy */
export type AsyncMiddyifedHandlerV1 = middy.MiddyfiedHandler<AWS_APIGatewayProxyEvent, APIGatewayProxyResult | object | void>;
/** LambdaUtils version of ProxyHandler for API Gateway v2 payload format */
export type AsyncProxyHandlerV2 = (event: APIGatewayProxyEventV2, context: Context, callback?: Callback<APIGatewayProxyStructuredResultV2>) => Promise<APIGatewayProxyStructuredResultV2 | object | void>;
/** LambdaUtils version of an API Gateway v12payload handler wrapped with middy */
export type AsyncMiddyifedHandlerV2 = middy.MiddyfiedHandler<AWS_APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 | object | void>;
