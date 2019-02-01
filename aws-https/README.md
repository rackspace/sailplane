# @sailplane/aws-http - HTTPS client with AWS Signature v4

## What?
The AwsHttps class is an HTTPS (notice, *not* HTTP) client purpose made for use in and with AWS environments.

This is part of the [sailplane](https://github.com/onicagroup/sailplane) library of
utilities for AWS Serverless in Node.js.

## Why?
- Simple Promise or async syntax
- Optionally authenticates to AWS via AWS Signature v4 using [aws4](https://www.npmjs.com/package/aws4)
- Familiar [options](https://nodejs.org/api/http.html#http_http_request_options_callback>)
- Helper to build request options from URL object
- Light-weight
- Easily extended for unit testing

## How?
See the [doc site](https://docs.onica.com/projects/sailplane) for usage and examples.
