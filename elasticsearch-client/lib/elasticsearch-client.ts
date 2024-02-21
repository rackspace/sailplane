import {Logger} from "@sailplane/logger";
import {AwsHttps, AwsHttpsOptions} from "@sailplane/aws-https";

const logger = new Logger('elasticsearch-client');

/**
 * All-inclusive possible properties of returned results from ElasticsearchClient
 */
export interface ElasticsearchResult {
    _shards?: {
        total: number,
        successful: number,
        failed: number,
        skipped?: number
    };
    _index?: string;
    _type?: string;
    _id?: string;
    _version?: number;
    result?: "created" | "deleted" | "noop";

    // GET one item
    found?: boolean;
    _source?: any;

    // GET _search
    took?: number;
    timed_out?: boolean;
    hits?: {
        total: number;
        max_score: number|null;
        hits?: [{
            _index: string;
            _type: string;
            _id: string;
            _score: number;
            _source?: any;
        }]
    }

    // POST _delete_by_query
    deleted?: number;
    failures?: any[];
}


/**
 * Lightweight Elasticsearch client for AWS.
 *
 * Suggested use with Injector:
 *   Injector.register(ElasticsearchClient, () => {
 *     const endpoint: string = process.env.ES_ENDPOINT!;
 *     logger.info("Connecting to Elasticsearch @ " + endpoint);
 *     return new ElasticsearchClient(new AwsHttps(), endpoint);
 *  });
 */
export class ElasticsearchClient {

    /**
     * Construct.
     * @param awsHttps injection of AwsHttps object to use.
     * @param {string} endpoint Elasticsearch endpoint host name
     */
    constructor(private readonly awsHttps: AwsHttps, private readonly endpoint: string) {
    }

    /**
     * Send a request to Elasticsearch.
     * @param {"GET" | "DELETE" | "PUT" | "POST"} method
     * @param {string} path per Elasticsearch Document API
     * @param {any?} body request content as object, if any for the API
     * @returns {Promise<ElasticsearchResult>} response from Elasticsearch. An HTTP 404
     *              response is translated into an ElasticsearchResult with found=false
     * @throws {Error{message,status,statusCode}} error if HTTP result is not 2xx or 404
     *              or unable to parse response. Compatible with http-errors package.
     */
    request(method: 'DELETE'|'GET'|'PUT'|'POST',
            path: string, body?: any): Promise<ElasticsearchResult> {

        const toSend: AwsHttpsOptions = {
            method: method,
            hostname: this.endpoint,
            path: path,
            headers: {
                'accept': 'application/json; charset=utf-8',
                'content-type': 'application/json; charset=utf-8',
            },
            timeout: 10000, //connection timeout milliseconds,
            body: body ? JSON.stringify(body) : undefined,
            awsSign: true
        };

        logger.info(`Elasticsearch request: ${method} ${path}`);

        return this.awsHttps.request(toSend)
            .catch(err => {
                if (err.statusCode === 404) {
                    return {
                        _shards: { total: 0, successful: 0, failed: 1},
                        found: false
                    };
                }
                else {
                    throw err;
                }
            });
    }
}
