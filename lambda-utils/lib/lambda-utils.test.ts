import {
    APIGatewayEvent,
    APIGatewayEventRequestContext,
    APIGatewayProxyResult,
    Context
} from "aws-lambda";
import * as LambdaUtils from "./lambda-utils";
import * as createError from "http-errors";

describe("LambdaUtils", () => {
    describe("wrapApiHandler", () => {

        test("wrapApiHandler apiSuccess", (endTest) => {
            // GIVEN
            const handler = LambdaUtils.wrapApiHandler(async (event: LambdaUtils.APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
                // Echo the event back
                return LambdaUtils.apiSuccess(event);
            });

            const body = { company: "Onica", tagline: "Innovation through Cloud Transformation" };
            const givenEvent: APIGatewayEvent = {
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
                requestContext: {} as APIGatewayEventRequestContext
            };

            // WHEN
            handler(givenEvent, {} as Context, (err, response: any) => {
                // THEN
                expect(err).toBeNull();

                // CORS header set in response
                expect(response.headers['Access-Control-Allow-Origin']).toEqual('*');

                const resultEvent: APIGatewayEvent = JSON.parse(response.body);

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

                endTest();
            });
        });

        test("wrapApiHandler promise object success", (endTest) => {
            // GIVEN
            const handler = LambdaUtils.wrapApiHandler(async (): Promise<any> => {
                return {message: 'Hello'};
            });

            const givenEvent: APIGatewayEvent = {
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
            handler(givenEvent, {} as Context, (err, response: APIGatewayProxyResult) => {
                // THEN
                expect(err).toBeNull();

                expect(response.statusCode).toEqual(200);
                expect(response.body).toEqual("{\"message\":\"Hello\"}");
                expect(response.headers!["Access-Control-Allow-Origin"]).toEqual("*");

                endTest();
            });
        });

        test("wrapApiHandler promise empty success", (endTest) => {
            // GIVEN
            const handler = LambdaUtils.wrapApiHandler(async (): Promise<any> => {
                return;
            });

            const givenEvent: APIGatewayEvent = {
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
            handler(givenEvent, {} as Context, (err, response: APIGatewayProxyResult) => {
                // THEN
                expect(err).toBeNull();

                expect(response.statusCode).toEqual(200);
                expect(response.body).toBeFalsy();
                expect(response.headers!["Access-Control-Allow-Origin"]).toEqual("*");

                endTest();
            });
        });

        test("wrapApiHandler throw Error", (endTest) => {
            // GIVEN
            const handler = LambdaUtils.wrapApiHandler(async (): Promise<APIGatewayProxyResult> => {
                throw new Error("oops");
            });

            // WHEN
            handler({} as APIGatewayEvent, {} as Context, (err, response: any) => {

                // THEN
                expect(err).toBeFalsy();
                expect(response.statusCode).toEqual(500);
                expect(response.body).toEqual("Error: oops");

                endTest();
            });
        });

        test("wrapApiHandler throw http-error", (endTest) => {
            // GIVEN
            const handler = LambdaUtils.wrapApiHandler(async (): Promise<APIGatewayProxyResult> => {
                throw new createError.NotFound();
            });

            // WHEN
            handler({} as APIGatewayEvent, {} as Context, (err, response: any) => {

                // THEN
                expect(err).toBeFalsy();
                expect(response).toEqual({
                    statusCode: 404,
                    body: 'NotFoundError: Not Found'
                });

                endTest();
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
