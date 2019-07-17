# @sailplane/lambda-utils - Lambda handler middleware

## What?

There's a lot of boilerplate in Lambda handlers. 
This collection of utility functions leverage the great [Middy](https://middy.js.org/)
library to add middleware functionality to Lambda handlers. 
You can extend it with your own middleware.

This is part of the [sailplane](https://github.com/onicagroup/sailplane) library of
utilities for AWS Serverless in Node.js.

## Why?
Middy gives you a great start as a solid middleware framework,
but by itself you are still repeating the middleware registrations
on each handler, its exception handler only works with errors created by the http-errors package,
and you still have to format your response in the shape required by API Gateway.

`LambdaUtils` takes Middy further and is extendable so that you can add your own
middleware (authentication & authorization, maybe?) on top of it.

Used with API Gateway, the included middlewares:

- Set CORS headers
- Normalize incoming headers to mixed-case
- If incoming content is JSON text, replaces event.body with parsed object
- Ensures that event.queryStringParameters and event.pathParameters are defined, to avoid TypeErrors
- Ensures that handler response is formatted properly as a successful API Gateway result
   - Unique to LambdaUtils!
   - Simply return what you want as the body of the HTTP response
- Catch http-errors exceptions into proper HTTP responses
- Catch other exceptions and return as HTTP 500
   - Unique to LambdaUtils!
   - Besides providing better feedback to the client, not throwing an exception out of your handler means that your
     instance will not be destroyed and suffer a cold start on the next invocation
- Leverages async syntax

## How?
See the [doc site](https://docs.onica.com/projects/sailplane) for usage and examples.
