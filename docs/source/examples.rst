More Examples
=============

This section includes some larger examples which use multiple packages.

Data Storage in Elasticsearch
-----------------------------

Uses:

* :doc:`aws_https`
* :doc:`elasticsearch_client`
* :doc:`injector`
* :doc:`logger`

.. code-block:: ts

    import {AwsHttps} from "@sailplane/aws-https";
    import {ElasticsearchClient} from "@sailplane/elasticsearch-client";
    import {Injector} from "@sailplane/injector";
    import {Logger} from "@sailplane/logger";
    import {Ticket} from "./ticket";

    const logger = new Logger('ticket-storage');
    const ES_TICKET_PATH_PREFIX = "/ticket/local/";

    // TODO: Ideally, put this in central place so it only runs once.
    Injector.register(ElasticsearchClient, () => {
        const endpoint: string = process.env.ES_ENDPOINT!;
        logger.info('Connecting to Elasticsearch @ ' + endpoint);
        return new ElasticsearchClient(new AwsHttps(), endpoint);
    });

    /**
     * Storage of service tickets in Elasticsearch on AWS.
     */
    export class TicketStorage {

        static readonly $inject = [ElasticsearchClient];
        constructor(private readonly es: ElasticsearchClient) {
        }

        /**
         * Fetch a previously stored ticket by its ID
         * @param {string} id
         * @returns {Promise<Ticket>} if not found, returns undefined
         */
        get(id: string): Promise<Ticket> {
            return this.es.request('GET', ES_TICKET_PATH_PREFIX + id)
                .then((esDoc: ElasticsearchResult) => esDoc._source as Ticket);
        }

        /**
         * Store a ticket. Creates or replaces automatically.
         *
         * @param {Ticket} ticket
         * @returns {Promise<Ticket>} data stored (should match 'ticket')
         */
        put(ticket: Ticket): Promise<Ticket> {
            const path = ES_TICKET_PATH_PREFIX + ticket.id;
            return this.es.request('PUT', path, ticket)
                .then(() => ticket);
        }

        /**
         * Query for tickets that are not closed.
         *
         * @param {string} company
         * @param {number} maxResults Maximum number of results to return
         * @returns {Promise<Ticket[]>}
         * @throws Forbidden if no company value provided
         */
        queryOpen(company: string, maxResults: number): Promise<Ticket[]> {
            let query = {
                bool: {
                    must_not: [
                        exists: {
                            field: "resolution"
                        }
                    ]
                }
            };

            return this.es.request('GET', ES_TICKET_PATH_PREFIX + '_search', {
                size: maxResults,
                query: query
            })
            .then((esResults: ElasticsearchResult) => {
                if (esResults.timed_out) {
                    throw new Error("Query of TicketStorage timed out");
                }
                else if (esResults.hits && esResults.hits.hits && esResults.hits.total) {
                    return esResults.hits.hits.map(esDoc => esDoc._source as Ticket);
                }
                else {
                    return [] as Ticket[];
                }
            });
        }

    }

    Injector.register(TicketStorage);

Serverless Framework Lambda
---------------------------

This example shows how to:

- Configure `Serverless Framework <https://serverless.com>`_ for use with :doc:`state_storage`.
- Cache StateStorage result in :doc:`expiring_value`.
- Use :doc:`lambda_utils` to simplify the lambda handler function.
- Do dependency injection with :doc:`injector`.
- Make HTTPS request with :doc:`aws_https`. No SigV4 signature required on this use.
- Log status and objects via :doc:`logger`.

.. code-block:: yaml

    # serverless.yml
    service:
    name: serverless-demo

    plugins:
      - serverless-webpack
      - serverless-offline
      - serverless-plugin-export-endpoints

    provider:
      name: aws
      runtime: nodejs8.10

      environment:
        STATE_STORAGE_PREFIX: /${opt:stage}/myapp

      iamRoleStatements:
        - Effect: Allow
          Action:
            - ssm:GetParameter
            - ssm:PutParameter
          Resource: "arn:aws:ssm:${opt:region}:*:parameter${self:provider.environment.STATE_STORAGE_PREFIX}/*"

    functions:
      getChatHistory:
        description: Retrieve some (more) history of the user's chat channel.
        handler: src/handlers.getChatHistory
        events:
          - http:
              method: get
              path: chat/history
              cors: true
              request:
                parameters:
                  querystrings:
                    channel: true
                    cursor: false

.. code-block:: ts

    import 'source-map-support/register';
    import {APIGatewayEvent} from 'aws-lambda';
    import {Injector} from "@sailplane/injector";
    import * as LambdaUtils from "@sailplane/lambda-utils";
    import {ChatService} from "./chat-service";
    import * as createHttpError from "http-errors";

    Injector.register(StateStorage, () => new StateStorage(process.env.STATE_STORAGE_PREFIX));

    /**
     * Fetch history of chat on the user's channel
     */
    export const getChatHistory = LambdaUtils.wrapApiHandler(async (event: LambdaUtils.APIGatewayProxyEvent) => {
        const channel = event.queryStringParameters.channel;
        const cursor = event.queryStringParameters.cursor;

        return Injector.get(ChatService)!.getHistory(channel, cursor);
    });

.. code-block:: ts

    // chat-service.ts
    import {AwsHttps} from "@sailplane/aws-https";
    import {ExpiringValue} from "@sailplane/expiring-value";
    import {Injector} from "@sailplane/injector";
    import {Logger} from "@sailplane/logger";
    import {URL} from "url";
    import * as createHttpError from "http-errors";

    const logger = new Logger('chat-service');

    const CONFIG_REFRESH_PERIOD = 15*60*1000; // 15 minutes

    //// Define Data Structures
    interface ChatConfig {
        url: string;
        authToken: string;
    }

    interface ChatMessage {
        from: string;
        when: number;
        text: string;
    }

    interface ChatHistory {
        messages: ChatMessage[];
        cursor: string;
    }

    /**
     * Service to interface with the external chat provider.
     */
    export class ChatService {
        private config = new ExpiringValue<ChatConfig>(
                () => this.stateStorage.get('ChatService', 'config') as ChatConfig,
                CONFIG_REFRESH_PERIOD);
        private readonly awsHttps = new AwsHttps();

        /** Construct */
        constructor(private readonly stateStorage: StateStorage) {
        }

        /**
         * Fetch history of a chat channel.
         */
        async getHistory(channelId: string, cursor?: string): Promise<ChatHistory> {
            logger.debug(`getHistory(${channelId}, ${cursor})`);
            const config = await this.config.get();

            // Fetch history from external chat provider
            let options = this.awsHttp.buildOptions('POST' new URL(config.url));
            options.headers = { authorization: 'TOKEN ' + config.authToken };
            options.body = JSON.stringify({
                channel: channelId
                cursor: cursor
            });

            const response = await this.awsHttp.request(options);

            // Check for error
            if (!response.ok) {
                logger.info("External history request returned error: ", response);
                throw new createHttpError.InternalServerError(response.error);
            }

            // Prepare results
            const history: ChatHistory =  {
                messages: [],
                cursor: response.next_cursor
            };

            // Process each message
            for (let msg of response.messages) {
                history.messages.push({
                    from: msg.username,
                    when: msg.ts
                    text: msg.text
                });
            }

            return history;
        }
    }

    Injector.register(ChatService, [StateStorage]);
