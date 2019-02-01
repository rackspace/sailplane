ElasticsearchClient
===================

Communicate with AWS Elasticsearch.

Overview
^^^^^^^^

Other solutions for communicating with Elasticsearch are either incompatible with AWS,
very heavy weight, or both. This client gets the job done and is as simple as it gets!

- Simple Promise or async syntax
- Authenticates to AWS via AWS Signature v4
- Light-weight

Use it with Elasticsearch's `Document API <https://www.elastic.co/guide/en/elasticsearch/reference/current/docs.html>`_.

``ElasticsearchClient`` depends on two other utilities to work:

- :doc:`aws_https`
- :doc:`logger`

Install
^^^^^^^

.. code-block:: shell

    npm install @sailplane/elasticsearch-client @sailplane/aws-https @sailplane/logger

Examples
^^^^^^^^

Simple example:

.. code-block:: ts

    get(id: string): Promise<Ticket> {
        return this.es.request('GET', '/ticket/local/' + id)
            .then((esDoc: ElasticsearchResult) => esDoc._source as Ticket);
    }

See :doc:`examples` for a comprehensive example.

Type Declarations
^^^^^^^^^^^^^^^^^

.. literalinclude:: ../../elasticsearch-client/dist/elasticsearch-client.d.ts
   :language: typescript
