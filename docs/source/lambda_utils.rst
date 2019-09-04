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
and you still have to format your response in the shape required by API Gateway.

``LambadUtils`` takes Middy further and is extendable so that you can add your own middleware
(authentication & authorization, maybe?) on top of it.

Used with API Gateway, the included middlewares:

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
   - Besides providing better feedback to the client, not throwing an exception out of your handler means that your
     instance will not be destroyed and suffer a cold start on the next invocation.
- Leverages async syntax.

See `Middy middlewares <https://middy.js.org/docs/middlewares.html>`_ for details on those.
Not all Middy middlewares are in this implementation, only common ones that are generally useful in all
APIs. You may extend LambdaUtils's ``wrapApiHandler()`` function in your projects,
or use it as an example to write your own, to add more middleware!

**WARNING**: Middy has, historically, introduced some `breaking changes <https://github.com/onicagroup/sailplane/issues/16>`_
in previous minor version bumps. LambdaUtils has been built and tested with Middy
0.29.0, and should continue to work with future versions, but bumping your
Middy version beyond 0.29.0 may produce some weird errors.


``LambdaUtils`` depends on two other utilities
 to work:

- :doc:`logger`
- `Middy <https://middy.js.org>`_

Install
^^^^^^^

.. code-block:: shell

    npm install @sailplane/lambda-utils @sailplane/logger middy

Examples
^^^^^^^^

General use
-----------

.. code-block:: ts

    import {APIGatewayEvent} from 'aws-lambda';
    import * as LambdaUtils from "@sailplane/lambda-utils";
    import * as createError from "http-errors";

    export const hello = LambdaUtils.wrapApiHandler(async (event: LambdaUtils.APIGatewayProxyEvent) => {
        // These event objects are now always defined, so don't need to check for undefined. 🙂
        const who = event.pathParameters.who;
        const points = parseInt(event.queryStringParameters.points || 0);

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
    import * as LambdaUtils from "@sailplane/lambda-utils";
    import {userAuthMiddleware} from "./user-auth"; //you write this

    export interface WrapApiHandlerOptions {
        noUserAuth?: boolean;
        requiredRole?: string;
    }

    export function wrapApiHandlerWithAuth(options: WrapApiHandlerOptions,
                                           handler: LambdaUtils.AsyncProxyHandler): ProxyHandler {
        let wrap = LambdaUtils.wrapApiHandler(handler);

        if (!options.noUserAuth) {
            wrap.use(userAuthMiddleware(options.requiredRole));
        }

        return wrap;
    }

Type Declarations
^^^^^^^^^^^^^^^^^

.. literalinclude:: ../../lambda-utils/dist/lambda-utils.d.ts
   :language: typescript
