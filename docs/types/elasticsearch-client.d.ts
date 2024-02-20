import { AwsHttps } from "@sailplane/aws-https";
/**
 * All-inclusive possible properties of returned results from ElasticsearchClient
 */
export interface ElasticsearchResult {
    _shards?: {
        total: number;
        successful: number;
        failed: number;
        skipped?: number;
    };
    _index?: string;
    _type?: string;
    _id?: string;
    _version?: number;
    result?: "created" | "deleted" | "noop";
    found?: boolean;
    _source?: any;
    took?: number;
    timed_out?: boolean;
    hits?: {
        total: number;
        max_score: number | null;
        hits?: [
            {
                _index: string;
                _type: string;
                _id: string;
                _score: number;
                _source?: any;
            }
        ];
    };
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
export declare class ElasticsearchClient {
    private readonly awsHttps;
    private readonly endpoint;
    /**
     * Construct.
     * @param awsHttps injection of AwsHttps object to use.
     * @param {string} endpoint Elasticsearch endpoint host name
     */
    constructor(awsHttps: AwsHttps, endpoint: string);
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
    request(method: 'DELETE' | 'GET' | 'PUT' | 'POST', path: string, body?: any): Promise<ElasticsearchResult>;
}
