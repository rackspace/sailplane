Logger
======

CloudWatch and serverless-offline friendly logger.

Overview
^^^^^^^^

Sadly, ``console.log`` is the #1 debugging tool when writing serverless code. Logger extends it with levels,
timestamps, context/category names, and object formatting. It's just a few small incremental improvements, and
yet together takes logging a leap forward.

If your transpiling, be sure to enable source maps
(in `Typescript <https://www.typescriptlang.org/docs/handbook/compiler-options.html>`_,
`Babel <https://babeljs.io/docs/en/options#source-map-options>`_) and use the
`source-map-support <https://www.npmjs.com/package/source-map-support>`_ library
so that you get meaningful stack traces.

Install
^^^^^^^

.. code-block:: shell

    npm install @sailplane/logger

Examples
^^^^^^^^

.. code-block:: ts

    import {Logger, LogLevels} from "@sailplane/logger";
    const logger = new Logger('name-of-module');

    logger.info("Hello World!");
    // INFO name-of-module: Hello World!

    Logger.globalLogLevel = LogLevels.INFO;
    logger.debug("DEBUG < INFO.");
    // No output

    Logger.logTimestamps = true;
    logger.info("Useful local log");
    // 2018-11-15T18:26:20 INFO name-of-module: Useful local log

    logger.warnObject("Exception ", {message: "oops"});
    // 2018-11-15T18:29:38 INFO name-of-module: Exception {message:"oops"}

    Logger.formatObjects = true;
    logger.errorObject("Exception ", {message: "oops"});
    // 2018-11-15T18:30:49 INFO name-of-module: Exception {
    //   message: "oops"
    // }

Configuration / Behavior
^^^^^^^^^^^^^^^^^^^^^^^^

The output of Logger varies based on some global settings, whether the Lambda is executing
in AWS or local (serverless-offline, SAM offline), and whether the runtime is Node.js 10 vs
earlier versions.

Default behavior should work for Lambdas. If you are using Logger in another container (EC2, Fargate, ...)
you likely will want to adjust these settings.

CloudWatch detection
--------------------

The default behaviors of some configuration change depending on whether log output is going
to CloudWatch vs local console. This is because within the AWS Lambda service, logging to
stdout is automatically prefixed with the log level and times stamp. Local console does not
So Logger adds these for you when a login shell (offline mode) is detected. You can force

Override from environment variable ``export LOG_TO_CLOUDWATCH=true`` or ``export LOG_TO_CLOUDWATCH=false``

globalLogLevel
--------------

Only this level and higher will be output. Options are 'DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'.
Default is 'DEBUG'.

Override programmatically:  ``Logger.globalLogLevel = 'WARN';``

Override from environment variable: ``export LOG_LEVEL=INFO``

outputLevels
-------------
If true, output level text on each line.

Default is true when running outside of AWS Lambda environment, and in a Lambda runtime earlier than Node.js v10.
Starting with Node.js v10, the Lambda runtime itself adds log levels to the output sent to CloudWatch. This is detected
and outputLevels is set to false.

Override programmatically: ``Logger.outputLevels = false;``

Override from environment variable ``export LOG_TO_CLOUDWATCH=true`` or ``export LOG_TO_CLOUDWATCH=false``

logTimestamps
-------------
Output date & time prefix on logged lines?

Timestamps are enabled outside of AWS Lambda, and disabled in AWS Lambda where CloudWatch provides time stamping.

Override programmatically: ``Logger.logTimestamps = false;``

Override from environment variable: ``export LOG_TIMESTAMPS=true``

formatObjects
-------------
If true, objects logged by debugObject(), infoObject(), warnObject() and errorObject() will be formatted with
proper indentation. If false, no formatting is performed.

Formatting is enabled outside of AWS Lambda, and disabled in AWS Lambda where CloudWatch provides formatting.

Override programmatically: ``Logger.formatObjects = false;``

Override from environment variable: ``export LOG_FORMAT_OBJECTS=true``

Type Declarations
^^^^^^^^^^^^^^^^^

.. literalinclude:: ../../logger/dist/logger.d.ts
   :language: typescript
