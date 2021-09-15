import {
    APIGatewayEventRequestContext,
    APIGatewayProxyEvent,
    APIGatewayProxyEventV2,
    APIGatewayProxyResult, APIGatewayProxyResultV2, APIGatewayProxyStructuredResultV2,
    Context
} from "aws-lambda";
import * as LambdaUtils from "./index";
import * as createError from "http-errors";

describe("LambdaUtils", () => {
    describe("wrapApiHandler", () => {

        test("wrapApiHandler apiSuccess", async () => {
            // GIVEN
            const handler = LambdaUtils.wrapApiHandler(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
                // Echo the event back
                return LambdaUtils.apiSuccess(event);
            });

            const body = { company: "Onica", tagline: "Innovation through Cloud Transformation" };
            const givenEvent: APIGatewayProxyEvent = {
                body: JSON.stringify(body),
                headers: {
                    "content-length": "0",
                    "CONTENT-TYPE": "application/json"
                },
                multiValueHeaders: {},
                httpMethod: "GET",
                isBase64Encoded: false,
                path: "/test",
                pathParameters: null,
                queryStringParameters: null,
                multiValueQueryStringParameters: null,
                stageVariables: null,
                resource: "tada",
                requestContext: {} as any
            };

            // WHEN
            const response = await handler(givenEvent, {} as Context, {} as any) as APIGatewayProxyResult;

            // THEN

            // CORS header set in response
            expect(response.headers?.['Access-Control-Allow-Origin']).toEqual('*');

            const resultEvent: APIGatewayProxyEvent = JSON.parse(response.body);

            // body was parsed from string to JSON in request event
            expect(resultEvent.body).toEqual(body);

            // Headers are normalized in request event
            expect(resultEvent.headers['Content-Length']).toBeUndefined();
            expect(resultEvent.headers['content-length']).toEqual('0');
            expect(resultEvent.headers["CONTENT-TYPE"]).toBeUndefined();
            expect(resultEvent.headers['content-type']).toEqual("application/json");

            // pathParameters and queryStringParameters are expanded to empty objects
            expect(resultEvent.pathParameters).toEqual({});
            expect(resultEvent.queryStringParameters).toEqual({});
        });

        test("wrapApiHandler v2 promise object success", async () => {
            // GIVEN
            const handler = LambdaUtils.wrapApiHandlerV2(async (): Promise<any> => {
                return {message: 'Hello'};
            });

            const givenEvent: APIGatewayProxyEventV2 = {
                version: "2",
                routeKey: "123",
                body: undefined,
                headers: {
                    Origin: "test-origin"
                },
                rawPath: "/test",
                rawQueryString: "",
                isBase64Encoded: false,
                pathParameters: undefined,
                queryStringParameters: undefined,
                requestContext: {
                    accountId: "123",
                    apiId: "abc",
                    domainName: "test",
                    domainPrefix: "unit",
                    http: {
                        method: "get",
                        path: "/test",
                        protocol: "http",
                        sourceIp: "1.1.1.1",
                        userAgent: "unit/test"
                    },
                    requestId: "abc",
                    routeKey: "123",
                    stage: "test",
                    time: "2021-08-30T16:58:31Z",
                    timeEpoch: 1000000
                }
            };

            // WHEN
            const response = await handler(givenEvent, {} as Context, {} as any) as APIGatewayProxyResultV2<any>;

            // THEN
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual("{\"message\":\"Hello\"}");
            // With HTTP APIs, API Gateway handles CORS, so it is ignored here.
            expect(response.headers?.["Access-Control-Allow-Origin"]).toBeUndefined();
        });

        test("wrapApiHandler promise empty success", async () => {
            // GIVEN
            const handler = LambdaUtils.wrapApiHandler(async (): Promise<any> => {
                return;
            });

            const givenEvent: APIGatewayProxyEvent = {
                body: null,
                headers: {},
                multiValueHeaders: {},
                httpMethod: "GET",
                isBase64Encoded: false,
                path: "/test",
                pathParameters: null,
                queryStringParameters: null,
                multiValueQueryStringParameters: null,
                stageVariables: null,
                resource: "",
                requestContext: {} as APIGatewayEventRequestContext
            };

            // WHEN
            const response = await handler(
                givenEvent, {} as Context, {} as any
            ) as APIGatewayProxyResult;

            // THEN
            expect(response.statusCode).toEqual(200);
            expect(response.body).toBeFalsy();
            expect(response.headers!["Access-Control-Allow-Origin"]).toEqual("*");
        });

        test("wrapApiHandler throw Error", async () => {
            // GIVEN
            const handler = LambdaUtils.wrapApiHandler(async (): Promise<APIGatewayProxyResult> => {
                throw new Error("oops");
            });

            // WHEN
            const response = await handler(
                {} as unknown as APIGatewayProxyEvent, {} as Context, {} as any
            ) as APIGatewayProxyResult;

            // THEN
            expect(response.statusCode).toEqual(500);
            expect(response.body).toEqual("Error: oops");
        });

        test("wrapApiHandlerV2 throw http-error", async () => {
            // GIVEN
            const handler = LambdaUtils.wrapApiHandlerV2(async (): Promise<APIGatewayProxyStructuredResultV2> => {
                throw new createError.NotFound();
            });

            // WHEN
            const response = await handler(
                {} as unknown as APIGatewayProxyEventV2, {} as Context, {} as any
            ) as APIGatewayProxyResult;

            // THEN
            expect(response).toEqual({
                statusCode: 404,
                body: 'NotFoundError: Not Found'
            });
        });
    });

    describe('apiSuccess', () => {
        test('apiSuccess without body', () => {
            // WHEN
            const result = LambdaUtils.apiSuccess();

            // THEN
            expect(result).toBeTruthy();
            expect(result.statusCode).toEqual(200);
            expect(result.body).toEqual('');
        });

        test('apiSuccess with body', () => {
            // GIVEN
            const resultBody = { hello: 'world' };

            // WHEN
            const result = LambdaUtils.apiSuccess(resultBody);

            // THEN
            expect(result).toBeTruthy();
            expect(result.statusCode).toEqual(200);
            expect(result.body).toEqual('{"hello":"world"}');
        });
    });

    describe('apiFailure', () => {
        test('apiFailure without body', () => {
            // WHEN
            const result = LambdaUtils.apiFailure(501);

            // THEN
            expect(result).toBeTruthy();
            expect(result.statusCode).toEqual(501);
            expect(result.body).toEqual('');
        });

        test('apiFailure with body', () => {
            // WHEN
            const result = LambdaUtils.apiFailure(418, "I'm a teapot");

            // THEN
            expect(result).toBeTruthy();
            expect(result.statusCode).toEqual(418);
            expect(result.body).toEqual("I'm a teapot");
        });
    });
});
