import { APIGatewayEventRequestContextWithAuthorizer } from "aws-lambda";
import middy from "@middy/core";
import { Logger } from "@sailplane/logger";
import { APIGatewayProxyEventAnyVersion } from "./types";

/**
 * Middleware for LambdaUtils to set request context in Logger
 */
export const loggerContextMiddleware = (): middy.MiddlewareObj<APIGatewayProxyEventAnyVersion> => {
  return {
    before: async (request) => {
      Logger.setLambdaContext(request.context);

      const requestContext = request.event.requestContext;
      const claims =
        (requestContext as APIGatewayEventRequestContextWithAuthorizer<any>)?.authorizer?.claims || // API v1
        (requestContext as any)?.authorizer?.jwt?.claims; // API v2

      const context = {
        api_request_id: requestContext?.requestId,
        jwt_sub: claims?.sub,
      };
      Logger.addAttributes(context);
    },
  };
};
