# @sailplane/logger - CloudWatch and serverless-offline friendly logger

## What?
Logger adds context and when needed, timestamps and JSON formatting, to log output.

This is part of the [sailplane](https://github.com/onicagroup/sailplane) library of
utilities for AWS Serverless in Node.js.

## Why?
Sadly, `console.log` is the #1 debugging tool when writing serverless code. Logger extends it with levels,
timestamps, context/category names, and object formatting. It's just a few small incremental improvements, and
yet together takes logging a leap forward. It'll do until we can have a usable cloud debugger. 

There are far more complicated logging packages available for Javascript;
but sailplane is all about simplicity, and this logger gives you all that
you really need without the bulk.

## How?
See the [doc site](https://docs.onica.com/projects/sailplane) for usage and examples.
