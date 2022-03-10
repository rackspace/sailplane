LambdaUtils
===========

Lambda handler middleware.

Overview
^^^^^^^^

There's a lot of boilerplate in Lambda handlers. This collection of utility functions leverages the great
`Middy <https://middy.js.org>`_ library to add middleware functionality to Lambda handlers.
You can extend it with your own middleware.

Middy gives you a great start as a solid middleware framework,
but by itself you are still repeating the middleware registrations
on each handler, its exception handler only works with errors created by the http-errors package,
its Typescript declarations are overly permissive,
and you still have to format your response in the shape required by API Gateway.

``LambdaUtils`` takes Middy further and is extendable so that you can add your own middleware
(ex: authentication & authorization) on top of it.

Used with API Gateway v1 (REST API) and v2 (HTTP API), the included middlewares are:

- Set CORS headers.
- Normalize incoming headers to mixed-case
- If incoming content is JSON text, replaces event.body with parsed object.
- Ensures that event.queryStringParameters and event.pathParameters are defined, to avoid TypeErrors.
- Ensures that handler response is formatted properly as a successful API Gateway result.
   - Unique to LambdaUtils!
   - Simply return what you want as the body of the HTTP response.
- Catch http-errors exceptions into proper HTTP responses.
- Catch other exceptions and return as HTTP 500.
   - Unique to LambdaUtils!
- Registers Lambda context with Sailplane's `logger <logger>` for structured logging. (Detail below.)
- Fully leverages Typescript and async syntax.

See `Middy middlewares <https://middy.js.org/#:~:text=available%20middlewares>`_ for details on those.
Not all Middy middlewares are in this implementation, only common ones that are generally useful in all
APIs. You may extend LambdaUtils's ``wrapApiHandler()`` function in your projects,
or use it as an example to write your own, to add more middleware!

``LambdaUtils`` depends on two other utilities to work:

- :doc:`logger`
- `Middy <https://middy.js.org>`_

Install
^^^^^^^

**To use LambdaUtils v4.x with Middy v2.x.x (latest):**

.. code-block:: shell

    npm install @sailplane/lambda-utils@4 @sailplane/logger @middy/core@2 @middy/http-cors@2 @middy/http-event-normalizer@2 @middy/http-header-normalizer@2 @middy/http-json-body-parser@2

The extra @middy/ middleware packages are optional if you write your own wrapper function that does not use them.
See below.

**To use LambdaUtils v3.x with Middy v1.x.x:**

.. code-block:: shell

    npm install @sailplane/lambda-utils@3 @sailplane/logger @middy/core@1 @middy/http-cors@1 @middy/http-event-normalizer@1 @middy/http-header-normalizer@1 @middy/http-json-body-parser@1

The extra @middy/ middleware packages are optional if you write your own wrapper function that does not use them.
See below.

**To use LambdaUtils v2.x with Middy v0.x.x:**

.. code-block:: shell

    npm install @sailplane/lambda-utils@2 @sailplane/logger middy@0

Upgrading
^^^^^^^^^

To upgrade from older versions of lambda-utils, remove the old lambda-utils and middy dependencies
and then follow the install instructions above to install the latest. See also the
`Middy upgrade instructions <https://github.com/middyjs/middy/blob/main/docs/UPGRADE.md>`_.

Structured Logging Attributes
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

When :doc:`structured logging <logger>` is enabled, LambdaUtils's ``wrapApiHandlerV1`` and ``wrapApiHandleV2``
include the ``loggerContextMiddleware``, which calls ``Logger.setLambdaContext`` for you and also
adds the following properties:

- ``api_request_id`` - the request ID from AWS API Gateway
- ``jwt_sub`` - JWT (including Cognito) authenticated subject of the request

Examples
^^^^^^^^

General use
-----------

.. code-block:: ts

    import {APIGatewayEvent} from 'aws-lambda';
    import * as LambdaUtils from "@sailplane/lambda-utils";
    import * as createError from "http-errors";

    export const hello = LambdaUtils.wrapApiHandlerV2(async (event: LambdaUtils.APIGatewayProxyEvent) => {
        // These event objects are now always defined, so don't need to check for undefined. 🙂
        const who = event.pathParameters.who;
        let points = Number(event.queryStringParameters.points || '0');

        if (points > 0) {
            let message = 'Hello ' + who;
            for (; points > 0; --points)
                message = message + '!';

            return {message};
        }
        else {
            // LambdaUtils will catch and return HTTP 400
            throw new createError.BadRequest('Missing points parameter');
        }
    });

See :doc:`examples` for another example.

Extending LambdaUtils for your own app
--------------------------------------

.. code-block:: ts

    import {ProxyHandler} from "aws-lambda";
    import middy from "@middy/core";
    import * as createError from "http-errors";
    import * as LambdaUtils from "@sailplane/lambda-utils";

    /** ID user user authenticated in running Lambda */
    let authenticatedUserId: string|undefined;

    export getAuthenticatedUserId(): string|undefined {
      return authenticatedUserId;
    }

    /**
     * Middleware for LambdaUtils to automatically manage AuthService context.
     */
    const authMiddleware = (requiredRole?: string): Required<middy.MiddlewareObj> => {
      return {
        before: async (request) => {
          const claims = request.event.requestContext.authorizer?.claims;

          const role = claims['custom:role'];
          if (requiredRole && role !== requiredRole) {
              throw new createError.Forbidden();
          }

          authenticatedUserId = claims?.sub;
          if (!authenticatedUserId) {
              throw new createError.Unauthorized("No user authorized");
          }
        },
        after: async (_) => {
          authenticatedUserId = undefined;
        },
        onError: async (_) => {
          authenticatedUserId = undefined;
        }
      };
    }

    export interface WrapApiHandlerOptions {
        noUserAuth?: boolean;
        requiredRole?: string;
    }

    export function wrapApiHandlerWithAuth(
        options: WrapApiHandlerOptions,
        handler: LambdaUtils.AsyncProxyHandlerV2
    ): LambdaUtils.AsyncMiddyifedHandlerV2 {
        const wrap = LambdaUtils.wrapApiHandlerV2(handler);

        if (!options.noUserAuth) {
            wrap.use(userAuthMiddleware(options.requiredRole));
        }

        return wrap;
    }

Type Declarations
^^^^^^^^^^^^^^^^^

.. literalinclude:: ../types/handler-utils.d.ts
   :language: typescript

.. literalinclude:: ../types/types.d.ts
   :language: typescript
