import {
    APIGatewayProxyEvent as AWS_APIGatewayProxyEvent,
    APIGatewayProxyEventV2 as AWS_APIGatewayProxyEventV2,
    APIGatewayProxyResult,
    APIGatewayProxyStructuredResultV2, Context
} from "aws-lambda";

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

export type APIGatewayProxyEventAnyVersion = AWS_APIGatewayProxyEvent | AWS_APIGatewayProxyEventV2;
export type APIGatewayProxyResultAnyVersion = APIGatewayProxyResult | APIGatewayProxyStructuredResultV2;

/**
 * Define the async version of ProxyHandler for either V1 or V2 payload format.
 */
export type AsyncProxyHandlerAnyVersion = (event: AWS_APIGatewayProxyEvent | AWS_APIGatewayProxyEventV2, context: Context) => Promise<any>;
