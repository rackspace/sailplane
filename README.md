# Sailplane - AWS Serverless Node.js Utilities in Javascript and Typescript

![](docs/sailplane.png)

## What is this?

While developing serverless applications at Onica (now part of [Rackspace Technology](https://www.rackspace.com)),
we found certain patterns being used repeatedly, and code being copied from one project to the next.
These commonalities have been extracted, matured, and gathered into a reusable collection.

Sailplane is the result: a collection of useful packages for use in developing code that runs in AWS.
They are primarily used in Lambda functions, but most are useful in other services that use the Node.js 18+
runtime as well.

The Typescript source is compiled to ES6 Javascript for portability, along with Typescript type
definition files. While the typing provides the expected benefit, these utilities may be used in plain
Javascript as well.

Every tool is the genesis of real world needs, and they continue to evolve.
This collection is part of Rackspace Technology's commitment to give back to the open source community.
Find this and other Rackspace open source repositories on [GitHub](https://github.com/rackspace).


## Content

Each utility is described on its own page:

* [AwsHttps - HTTPS client with AWS Signature v4](docs/aws_https.md)
* [ElasticsearchClient - Communicate with AWS Elasticsearch](docs/elasticsearch_client.md)
* [ExpiringValue - Value that is instantiated on-demand and cached for a limited time](docs/expiring_value.md)
* [Injector - Light-weight and type-safe Dependency Injection](docs/injector.md)
* [LambdaUtils - AWS Lambda handler middleware](docs/lambda_utils.md)
* [Logger - CloudWatch and serverless-offline friendly logger](docs/logger.md)
* [StateStorage - Serverless state and configuration storage](docs/state_storage.md)
* [More Examples](docs/examples.md)
* [License](docs/license.md)

## Why "Sailplane"?

Onica's early OSS releases have had aviation themed names;
this may or may not have something to do with the CTO being a pilot. Nobody really knows.

Sailplane was selected for this *serverless* toolset by considering that
serverless is to computing without the complexities of a server,
as a sailplane is to flight without the complexities of an airplane.

And that's it. Also, the NPM scope was available.

![](docs/sailplane.png)

## Development

Use the `make.sh` script to build all of the projects in an order that resolves the dependencies between them.

```
$ ./make.sh clean   # delete all node_modules directories
$ ./make.sh build   # npm install, test, and build all packages
$ ./make.sh check   # check what packages need to be published
$ ./make.sh publish # npm publish packages with new version numbers (must have bump versions first and have permission)
$ ./make.sh all     # do clean, build, & publish
```
