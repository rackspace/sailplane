/// <reference types="node" />
import { Credentials, CredentialsOptions } from "aws-sdk/lib/credentials";
import * as https from "https";
import { URL } from "url";
/**
 * Same options as https://nodejs.org/api/http.html#http_http_request_options_callback
 * with the addition of optional body to send with POST, PUT, or PATCH
 * and option to AWS Sig4 sign the request.
 */
export declare type AwsHttpsOptions = https.RequestOptions & {
    /** Body content of HTTP POST, PUT or PATCH */
    body?: string;
    /** If true, apply AWS Signature v4 to the request */
    awsSign?: boolean;
};
/**
 * Light-weight utility for making HTTPS requests in AWS environments.
 */
export declare class AwsHttps {
    private readonly verbose?;
    /** Resolves when credentials are available - shared by all instances */
    private static credentialsInitializedPromise;
    /** Credentials to use in this instance */
    private awsCredentials?;
    /**
     * Constructor.
     * @param verbose true to log everything, false for silence,
     *                undefined (default) for normal logging.
     * @param credentials
     *      If not defined, credentials will be obtained by default SDK behavior for the runtime environment.
     *                      This happens once and then is cached; good for Lambdas.
     *      If `true`, clear cached to obtain fresh credentials from SDK.
     *                 Good for longer running containers that rotate credentials.
     *      If an object with accessKeyId, secretAccessKey, and sessionToken,
     *                 use these credentials for this instance.
     */
    constructor(verbose?: boolean | undefined, credentials?: boolean | Credentials | CredentialsOptions);
    /**
     * Perform an HTTPS request and return the JSON body of the result.
     *
     * @params options https request options, with optional body and awsSign
     * @returns parsed JSON content, or null if none.
     * @throws {Error{message,status,statusCode}} error if HTTP result is not 2xx or unable
     *              to parse response. Compatible with http-errors package.
     */
    request(options: AwsHttpsOptions): Promise<any | null>;
    /**
     * Helper to build a starter AwsHttpsOptions object from a URL.
     *
     * @param method an HTTP method/verb
     * @param url the URL to request from
     * @param connectTimeout (default 5000) milliseconds to wait for connection to establish
     * @returns an AwsHttpsOptions object, which may be further modified before use.
     */
    buildOptions(method: 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH', url: URL, connectTimeout?: number): AwsHttpsOptions;
    /**
     * Helper for signing AWS requests
     * @param request to make
     * @return signed version of the request.
     */
    private awsSign;
}
