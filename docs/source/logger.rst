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

    import {Logger, LogLevels} from "@onica-serverless/logger";
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

Default formatting has no timestamps and no pretty formatting for JSON objects. This is optimum
for CloudWatch use. If serverless-offline is detected, timestamps and JSON pretty formatting are
automatically enabled for ideal terminal window viewing.

Type Declarations
^^^^^^^^^^^^^^^^^

.. literalinclude:: ../../logger/dist/logger.d.ts
   :language: typescript
