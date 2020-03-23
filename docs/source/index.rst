.. image:: sailplane.png
   :height: 128
   :width: 128
   :align: right

Sailplane - AWS Serverless Node.js Utilities
============================================

What is this?
^^^^^^^^^^^^^

While developing serverless applications at `Onica <https://www.onica.com>`_, we found certain patterns being
used repeatedly, and code being copied from one project to the next. These commonalities have been extracted,
matured, and gathered into a reusable collection.

Sailplane is the result: a collection of useful packages for use in developing code that runs in AWS.
They are primarily used in Lambda functions, but most are useful in other services that use the Node.js 10+
runtime as well.

The Typescript source is compiled to ES6 Javascript for portability, along with Typescript type
definition files. While the typing provides the expected benefit, these utilities may be used in plain
Javascript as well.

Every tool is the genesis of real world needs, and they continue to evolve.
This collection is part of `Onica's <https://www.onica.com>`_
commitment to give back to the open source community.
Find this and other Onica open source repositories on `GitHub <https://github.com/onicagroup>`_.


Content
^^^^^^^

Each utility is described on its own page:

* :doc:`AwsHttps - HTTPS client with AWS Signature v4 <aws_https>`
* :doc:`ElasticsearchClient - Communicate with AWS Elasticsearch <elasticsearch_client>`
* :doc:`ExpiringValue - Value that is instantiated on-demand and cached for a limited time <expiring_value>`
* :doc:`Injector - Light-weight and type-safe Dependency Injection <injector>`
* :doc:`LambdaUtils - Lambda handler middleware <lambda_utils>`
* :doc:`Logger - CloudWatch and serverless-offline friendly logger <logger>`
* :doc:`StateStorage - Serverless state and configuration storage <state_storage>`
* :doc:`More Examples <examples>`
* :doc:`License <license>`

.. toctree::
   :maxdepth: 2
   :hidden:

   aws_https
   elasticsearch_client
   expiring_value
   injector
   lambda_utils
   logger
   state_storage
   examples
   license

Why Sailplane?
^^^^^^^^^^^^^^

Onica's early OSS releases have had aviation themed names;
this may or may not have something to do with the CTO being a pilot. Nobody really knows.

.. image:: sailplane.png
   :height: 64
   :width: 64
   :align: right

Sailplane was selected for this *serverless* toolset by considering that
serverless is to computing without the complexities of a server,
as a sailplane is to flight without the complexities of an airplane.

And that's it. Also, the NPM scope was available.
