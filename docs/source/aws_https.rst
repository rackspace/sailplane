AwsHttps
========

HTTPS client with AWS Signature v4.

Overview
^^^^^^^^

The AwsHttps class is an HTTPS (notice, *not* HTTP) client purpose made for use in and with AWS environments.

- Simple Promise or async syntax
- Optionally authenticates to AWS via AWS Signature v4 using `aws4 <https://www.npmjs.com/package/aws4>`_
- Familiar `options <https://nodejs.org/api/http.html#http_http_request_options_callback>`_.
- Helper to build request options from URL object
- Light-weight
- Easily extended for unit testing

AwsHttps is dependent on :doc:`logger` and `AWS4 <https://github.com/mhart/aws4>`_ for signing.

Install
^^^^^^^

.. code-block:: shell

    npm install @sailplane/aws-https @sailplane/logger

Examples
^^^^^^^^

Simple example to GET from URL:

.. code-block:: ts

    const url = new URL('https://www.onica.com/ping.json');
    const http = new AwsHttps();

    // Build request options from a method and URL
    const options = http.buildOptions('GET' url);

    // Make request and parse JSON response.
    const ping = await http.request(options);


Example hitting API with the container's AWS credentials:

.. code-block:: ts

    const awsHttp = new AwsHttps();
    const options: AwsHttpsOptions = {
        // Same options as https://nodejs.org/api/http.html#http_http_request_options_callback
        method: 'GET',
        hostname: apiEndpoint,
        path: '/cloud-help',
        headers: {
            'accept': 'application/json; charset=utf-8',
            'content-type': 'application/json; charset=utf-8'
        },
        timeout: 10000,

        // Additional option for POST, PUT, or PATCH:
        body: JSON.stringify({ website: "https://www.onica.com" }),

        // Additional option to apply AWS Signature v4
        awsSign: true
    };

    try {
        const responseObj = await awsHttp.request(options);
        process(responseObj);
    }
    catch (err) {
        // HTTP status response is in statusCode field
        if (err.statusCode === 404) {
            process(undefined);
        }
        else {
            throw err;
        }
    }

Example hitting API with the custom AWS credentials:

.. code-block:: ts

    // Call my helper function to get credentials with AWS.STS
    const roleCredentials = await this.getAssumeRoleCredentials();

    const awsCredentials = {
        accessKey: roleCredentials.AccessKeyId,
        secretKey: roleCredentials.SecretAccessKey,
        sessionToken: roleCredentials.SessionToken,
    };
    const http = new AwsHttps(false, awsCredentials);

    // Build request options from a method and URL
    const url = new URL('https://www.onica.com/ping.json');
    const options = http.buildOptions('GET' url);

    // Make request and parse JSON response.
    const ping = await http.request(options);


The :doc:`elasticsearch_client` package is a simple example using AwsHttps.

Unit testing your services
^^^^^^^^^^^^^^^^^^^^^^^^^^

- Have your service receive ``AwsHttps`` in the constructor. Consider using :doc:`injector`.
- In your service unit tests, create a new class that extends AwsHttps and returns your canned response.
- Pass your fake AwsHttps class into the constructor of your service under test.

.. code-block:: ts

    export class AwsHttpsFake extends AwsHttps {
        constructor() {
            super();
        }

        async request(options: AwsHttpsOptions): Promise<any | null> {
            // Check for expected options. Example:
            expect(options.path).toEqual('/expected-path');

            // Return canned response
            return Promise.resolve({ success: true });
        }
    }

Type Declarations
^^^^^^^^^^^^^^^^^

.. literalinclude:: ../types/aws-https.d.ts
   :language: typescript
