Logger
======

CloudWatch and local development friendly logger with optional structured logging, while still small and easy to use.

Overview
^^^^^^^^

Sadly, ``console.log`` is the #1 debugging tool when writing serverless code. Logger extends it with levels,
timestamps, context/category names, object formatting, and optional structured logging.
It's just a few incremental improvements, and yet together takes logging a leap forward.

If your transpiling, be sure to enable source maps
(in `Typescript <https://www.typescriptlang.org/docs/handbook/compiler-options.html>`_,
`Babel <https://babeljs.io/docs/en/options#source-map-options>`_) and the enable use via the
`source-map-support <https://www.npmjs.com/package/source-map-support>`_ library or
`Node.js enable-source-maps option <https://nodejs.org/dist/latest-v14.x/docs/api/cli.html#cli_enable_source_maps>`_
so that you get meaningful stack traces.

Install
^^^^^^^

.. code-block:: shell

    npm install @sailplane/logger

Examples
^^^^^^^^

.. code-block:: ts

    import {Logger, LogLevel} from "@sailplane/logger";
    const logger = new Logger('name-of-module');

    logger.info("Hello World!");
    // INFO name-of-module: Hello World!

    Logger.initialize({level: LogLevel.INFO});
    logger.debug("DEBUG < INFO.");
    // No output

    Logger.initialize({logTimestamps: true});
    logger.info("Useful local log");
    // 2018-11-15T18:26:20 INFO name-of-module: Useful local log

    logger.warn("Exception ", {message: "oops"});
    // 2018-11-15T18:29:38 INFO name-of-module: Exception {message:"oops"}

    Logger.initialize({format: "PRETTY"});
    logger.error("Exception ", {message: "oops"});
    // 2018-11-15T18:30:49 INFO name-of-module: Exception {
    //   message: "oops"
    // }

    Logger.initialize({
      format: "STRUCT",
      attributes: { aws_request_id: context.requestId }
    });
    logger.error("Processing Failed", new Error("Unreachable");
    // {
    //   aws_region: "us-east-1",
    //   function_name: "myDataProcessor",
    //   function_version: "42",
    //   aws_request_id: "ebfb6f2f-8f2f-4e2e-a0a9-4495e90a4316",
    //   stage: "prod",
    //   level: "ERROR",
    //   module: "name-of-module",
    //   timestamp: "2022-03-03T17:32:19",
    //   message: "Processing Failed",
    //   value: {
    //     name: "Error",
    //     message: "Unreachable",
    //     stack: "Error: Unreachable\n  at /home/adam/my-project/src/service/processor.service.ts:83\n  at ..."
    //     source: "/home/adam/my-project/src/service/processor.service.ts:83"
    //   }
    // }

Configuration / Behavior
^^^^^^^^^^^^^^^^^^^^^^^^

The output of Logger varies based on some global settings and whether the Lambda is executing
in AWS or local (serverless-offline, SAM offline).

Default behavior should work for Lambdas. If you are using Logger in another container (EC2, Fargate, ...)
you likely will want to adjust these settings.

CloudWatch detection
--------------------

The default behaviors of some configuration change depending on whether log output is going
to CloudWatch vs local console. This is because within the AWS Lambda service, logging to
stdout is automatically prefixed with the log level and timestamp. Local console does not
So Logger adds these for you when a login shell (offline mode) is detected. You can force

Override from environment variable ``export LOG_TO_CLOUDWATCH=true`` or ``export LOG_TO_CLOUDWATCH=false``

Note: The above is ignored when using structured logging.

Recommendations
---------------

The best logging format often depends on the environment/stage. It may be selected via the ``LOG_FORMAT``
environment variable.

For local development, the default format is ``PRETTY`` and this is usually the most readable in a terminal window.

For deployment to AWS in lower stage environments (ex: dev), the default is ``FLAT`` and is recommended.
When viewed in CloudWatch AWS Console, it will handle pretty printing JSON output when a line is expanded.

For higher environments (ex: production), the default is still ``FLAT`` but ``STRUCT`` is suggested to allow
for analysis of massive log content, when using
`Amazon CloudWatch Logs Insights <https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html>`_
or an `ELK stack <https://aws.amazon.com/opensearch-service/the-elk-stack/>`_.


Type Declarations
^^^^^^^^^^^^^^^^^

.. literalinclude:: ../types/common.d.ts
   :language: typescript

.. literalinclude:: ../types/logger.d.ts
   :language: typescript
