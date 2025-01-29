# ElasticsearchClient

Communicate with AWS Elasticsearch or Open Search.

## Overview

Other solutions for communicating with Elasticsearch are either incompatible with AWS,
very heavy weight, or both. This client gets the job done and is as simple as it gets!

- Simple Promise or async syntax
- Authenticates to AWS via AWS Signature v4
- Light-weight

Use it with Elasticsearch's [Document API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs.html).

`ElasticsearchClient` depends on two other utilities to work:

- Sailplane [AwsHttps](aws_https.md)
- Sailplane [Logger](logger.md)

## Install

```shell
npm install @sailplane/elasticsearch-client @sailplane/aws-https @sailplane/logger
```

## API Documentation

[API Documentation on jsDocs.io](https://www.jsdocs.io/package/@sailplane/elasticsearch-client)

## Examples

Simple example:

```ts
function get(id: string): Promise<Ticket> {
  return this.es
    .request("GET", "/ticket/local/" + id)
    .then((esDoc: ElasticsearchResult) => esDoc._source as Ticket);
}
```

See [examples](examples.md) for a comprehensive example.
